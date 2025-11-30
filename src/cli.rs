use std::net::{IpAddr, Ipv4Addr};

use clap::Parser;

#[derive(Parser)]
#[clap(version = env!("GIT_VERSION_FULL"), about, long_about = None)]
pub struct Cli {
    #[arg(short = 'a', long = "address", default_value_t = IpAddr::V4(Ipv4Addr::new(0,0,0,0)), env = "BACKEND_ADDRESS")]
    /// Address on which the backend listens
    pub address: IpAddr,

    #[arg(short = 'p', long = "port", default_value_t = 8899, env = "BACKEND_PORT")]
    /// Port to which the backend binds
    pub port: u16,

    #[arg(short = 'c', long = "config", default_value_t = String::from("config.toml"), env = "CONFIG_PATH")]
    /// Path to the config file
    pub config_path: String,

    #[cfg(feature = "static-frontend")]
    #[arg(short = 'f', long = "frontend", default_value_t = String::from("frontend"), env = "FRONTEND_PATH")]
    /// Path to the static frontend directory
    pub frontend_path: String,
}
