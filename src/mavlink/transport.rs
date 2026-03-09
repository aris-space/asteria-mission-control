use std::pin::Pin;
use std::task::{Context, Poll};

use tokio::io::{AsyncRead, AsyncWrite, Error as IoError, ReadBuf};
use tokio::net::{TcpStream, UdpSocket};
use tokio_serial::{SerialPortBuilderExt, SerialStream};

use crate::config::MavlinkAddress;

/// Enum holding the different transport backends we'll use for MavLink communication.
///
/// Since mavio readers and writers contain the transport in their type, we need to have this
/// enum which combines all supported transports into a single enum which implements the
/// [`AsyncWrite`] and [`AsyncRead`] traits such that it can be used by [`mavio::io::TokioWriter`]
/// and [`mavio::io::TokioReader`].
pub enum AsyncTransportStream {
    Tcp(TcpStream),
    Udp(UdpSocket),
    Serial(SerialStream),
}

impl AsyncTransportStream {
    pub async fn new(address: &MavlinkAddress) -> Result<Self, IoError> {
        match address {
            MavlinkAddress::Udp { local, remote } => {
                let socket = UdpSocket::bind(local).await?;
                socket.connect(remote).await?;
                Ok(AsyncTransportStream::Udp(socket))
            }
            MavlinkAddress::Tcp { remote: address } => {
                let stream = TcpStream::connect(address).await?;
                Ok(AsyncTransportStream::Tcp(stream))
            }
            MavlinkAddress::Serial { path, baud_rate } => {
                let mut stream = tokio_serial::new(path, *baud_rate).open_native_async()?;
                // We want exclusive access to the serial device.
                stream.set_exclusive(true)?;
                Ok(AsyncTransportStream::Serial(stream))
            }
        }
    }
}

impl AsyncWrite for AsyncTransportStream {
    fn poll_write(self: Pin<&mut Self>, cx: &mut Context<'_>, buf: &[u8]) -> Poll<Result<usize, std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_write(Pin::new(stream), cx, buf),
            AsyncTransportStream::Serial(stream) => AsyncWrite::poll_write(Pin::new(stream), cx, buf),
            AsyncTransportStream::Udp(socket) => socket.poll_send(cx, buf),
        }
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_flush(Pin::new(stream), cx),
            AsyncTransportStream::Serial(stream) => AsyncWrite::poll_flush(Pin::new(stream), cx),
            AsyncTransportStream::Udp(_) => Poll::Ready(Ok(())),
        }
    }

    fn poll_shutdown(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_shutdown(Pin::new(stream), cx),
            AsyncTransportStream::Serial(stream) => AsyncWrite::poll_shutdown(Pin::new(stream), cx),
            AsyncTransportStream::Udp(_) => Poll::Ready(Ok(())),
        }
    }
}

impl AsyncRead for AsyncTransportStream {
    fn poll_read(self: Pin<&mut Self>, cx: &mut Context<'_>, buf: &mut ReadBuf<'_>) -> Poll<std::io::Result<()>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncRead::poll_read(Pin::new(stream), cx, buf),
            AsyncTransportStream::Serial(stream) => AsyncRead::poll_read(Pin::new(stream), cx, buf),
            AsyncTransportStream::Udp(socket) => socket.poll_recv(cx, buf),
        }
    }
}
