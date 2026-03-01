use std::pin::Pin;
use std::task::{Context, Poll};

use tokio::io::{AsyncRead, AsyncWrite, Error as IoError, ReadBuf};
use tokio::net::{TcpStream, UdpSocket};

use crate::config::MavlinkAddress;

pub enum AsyncTransportStream {
    Tcp(TcpStream),
    Udp(UdpSocket),
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
        }
    }
}

impl AsyncWrite for AsyncTransportStream {
    fn poll_write(self: Pin<&mut Self>, cx: &mut Context<'_>, buf: &[u8]) -> Poll<Result<usize, std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_write(Pin::new(stream), cx, buf),
            AsyncTransportStream::Udp(socket) => socket.poll_send(cx, buf),
        }
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_flush(Pin::new(stream), cx),
            AsyncTransportStream::Udp(_) => Poll::Ready(Ok(())),
        }
    }

    fn poll_shutdown(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncWrite::poll_shutdown(Pin::new(stream), cx),
            AsyncTransportStream::Udp(_) => Poll::Ready(Ok(())),
        }
    }
}

impl AsyncRead for AsyncTransportStream {
    fn poll_read(self: Pin<&mut Self>, cx: &mut Context<'_>, buf: &mut ReadBuf<'_>) -> Poll<std::io::Result<()>> {
        match self.get_mut() {
            AsyncTransportStream::Tcp(stream) => AsyncRead::poll_read(Pin::new(stream), cx, buf),
            AsyncTransportStream::Udp(socket) => socket.poll_recv(cx, buf),
        }
    }
}
