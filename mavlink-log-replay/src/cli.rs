use clap::Parser;

#[derive(Parser)]
pub struct Cli {
    /// Path to the MavLink logs JSONL file
    #[arg(short = 'p', long = "path", env = "LOG_PATH")]
    pub path: String,

    /// Boolean whether the replay of the log should be repeated indefinitely
    #[arg(short = 'r', long = "repeat", default_value_t = false, env = "REPLAY_REPEAT", global = true)]
    pub repeat: bool,

    /// Factor by which the timeouts between the messages should be sped up
    #[arg(short = 's', long = "speed", default_value_t = 1.0, env = "REPLAY_SPEED", global = true)]
    pub speed: f32,

    /// A timeout to wait between repetitions.
    #[arg(short = 'm', long = "repeat-timeout-ms", default_value_t = 0, env = "REPLAY_REPEAT_TIMEOUT_MS", global = true)]
    pub repeat_timeout_ms: u64,

    #[command(subcommand)]
    pub mavlink_address: MavlinkAddress,
}

#[derive(clap::Subcommand)]
pub enum MavlinkAddress {
    Serial {
        /// Path to a serial device
        path: String,
        /// The baud rate which should be used for this serial device
        baud_rate: u32,
    },
    Tcp {
        /// IP address and port used for TCP communication
        address: String,
    },
}

impl From<MavlinkAddress> for mavlink_lib::MavlinkAddress {
    fn from(value: MavlinkAddress) -> Self {
        match value {
            MavlinkAddress::Serial { path, baud_rate } => mavlink_lib::MavlinkAddress::Serial { path, baud_rate },
            MavlinkAddress::Tcp { address } => mavlink_lib::MavlinkAddress::Tcp { remote: address },
        }
    }
}
