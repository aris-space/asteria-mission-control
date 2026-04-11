use crate::CONFIG_PATH;
use schemars::JsonSchema;
use serde::{Deserialize, Deserializer, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};
use utoipa::ToSchema;

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Error whilst reading config: {0}")]
    Read(std::io::Error),
    #[error("Error whilst deserializing config: {0}")]
    Deserialize(toml::de::Error),
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct Config {
    /// MavLink related configuration.
    pub mavlink: MavlinkConfig,
    /// Available remote computers for the mission control.
    pub remotes: HashMap<String, RemoteComputerConfig>,
}

impl Config {
    /// Parse the config at a given path
    pub fn parse(path: &Path) -> Result<Arc<Self>, ConfigError> {
        let config_str = fs::read_to_string(path).map_err(ConfigError::Read)?;
        let config = toml::from_str::<Config>(&config_str).map_err(ConfigError::Deserialize)?;
        Ok(Arc::new(config))
    }
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, ToSchema, Clone)]
pub enum RemoteComputerKind {
    #[serde(rename = "flight computer", alias = "fc")]
    FlightComputer,
    #[serde(rename = "rfs computer", alias = "rfsc")]
    RfsComputer,
}

#[derive(Debug, Deserialize, JsonSchema, Clone)]
pub struct RemoteComputerConfig {
    /// Kind of remote computer this config is for.
    pub kind: RemoteComputerKind,
    /// A short description about the remote.
    pub description: String,
    /// Address for communicating with the remote computer
    /// over MavLink.
    #[serde(alias = "mavlink")]
    pub mavlink_address: MavlinkAddress,
    /// Configuration for establishing a SSH connection
    /// to the remote computer.
    #[expect(unused)]
    pub ssh: SshConfig,

    // This is only until the PR for the remote-computers is merged, which
    // broadcasts the config hash.
    /// Path to the drawio SVG+XML file of the state machine.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(alias = "diagram", deserialize_with = "deserialize_relative_path")]
    pub diagram_path: PathBuf,
    /// Path to the remote computers config which specifies the valid
    /// state transitions of this state machine.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(alias = "config", deserialize_with = "deserialize_relative_path")]
    pub config_path: PathBuf,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct MavlinkConfig {
    /// Address under which the MavLink router is available.
    // pub address: MavlinkAddress,
    /// System id which should be used by the backend when sending messages
    pub system_id: u8,
}

#[derive(Debug, Deserialize, JsonSchema, Clone)]
#[serde(tag = "protocol", rename_all = "lowercase")]
pub enum MavlinkAddress {
    /// IP address and port used for TCP communication
    Tcp { remote: String },
    /// Path to a serial device together with the baud rate used
    Serial { path: String, baud_rate: u32 },
}

#[derive(Debug, Deserialize, JsonSchema, Clone)]
#[expect(unused)]
pub struct SshConfig {
    /// Host name of the remote computer.
    pub host: String,
    /// Port on which the SSH daemon is running on
    /// the remote computer.
    pub port: Option<u16>,
    /// Name of the user as which the connection should
    /// be attempted.
    pub user: Option<String>,
    /// Authentication to use for the SSH connection.
    pub authentication: SshAuthentication,
}

#[derive(Debug, Deserialize, JsonSchema, Clone)]
#[serde(tag = "type", rename_all = "lowercase")]
#[expect(unused)]
pub enum SshAuthentication {
    /// Use password authentication.
    Password { password: String },
    /// Use the public key at the specified path for public-key authentication.
    PublicKey {
        /// **Important**: If this path is relative, it needs to be relative to the location
        ///                of the config file and will be joined onto the config file path.
        #[serde(deserialize_with = "deserialize_relative_path")]
        key_path: PathBuf,
    },
    /// Use passwordless authentication.
    None,
}

/// Deserialize a [`PathBuf`] and ensure that it's an absolute path or a valid relative
/// path to the config file.
fn deserialize_relative_path<'de, D>(deserializer: D) -> Result<PathBuf, D::Error>
where
    D: Deserializer<'de>,
{
    let relative_path = PathBuf::deserialize(deserializer)?;
    let config_path = CONFIG_PATH.get().expect("global config path should be initialized");
    let config_parent_path = config_path.parent().map(Path::to_path_buf).unwrap_or_default();

    let absolute_path = config_parent_path.join(&relative_path);

    let canonicalized_path = match absolute_path.canonicalize() {
        Ok(path) => path,
        Err(..) => {
            return Err(serde::de::Error::custom(format!(
                "Path '{}' cannot be canonicalized or does not exist",
                absolute_path.display()
            )));
        }
    };

    Ok(canonicalized_path)
}
