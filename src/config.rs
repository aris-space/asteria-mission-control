use crate::CONFIG_PATH;

use schemars::JsonSchema;
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
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
    /// Path to a local repository which is used to get the remote computer configs from.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(deserialize_with = "deserialize_relative_path", alias = "configs_repository")]
    pub configs_repository_path: PathBuf,
    /// Available remote computers for the mission control.
    #[serde(rename = "remote")]
    pub remotes: BTreeMap<String, RemoteComputerConfig>,
    /// PSS diagram config.
    pub pss: PssConfig,
    /// Influx database config.
    pub influx: InfluxConfig,
    /// Available tile servers for the mission control.
    pub tiles: BTreeMap<String, TilesConfig>,
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
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct MavlinkConfig {
    /// System id which should be used by the backend when sending messages
    pub system_id: u8,
    /// Directory where the MavLink logs should be saved.
    pub logs_path: PathBuf,
}

#[derive(Debug, Deserialize, JsonSchema, Clone)]
#[serde(tag = "protocol", rename_all = "lowercase")]
pub enum MavlinkAddress {
    /// IP address and port used for TCP communication
    Tcp { remote: String },
    /// Path to a serial device together with the baud rate used
    Serial { path: String, baud_rate: u32 },
}

impl From<MavlinkAddress> for mavlink_lib::MavlinkAddress {
    fn from(value: MavlinkAddress) -> Self {
        match value {
            MavlinkAddress::Tcp { remote } => mavlink_lib::MavlinkAddress::Tcp { remote },
            MavlinkAddress::Serial { path, baud_rate } => mavlink_lib::MavlinkAddress::Serial { path, baud_rate },
        }
    }
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct PssConfig {
    /// Path to a PSS diagram for the rocket.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(deserialize_with = "deserialize_relative_path", alias = "rocket_diagram")]
    pub rocket_diagram_path: PathBuf,
    /// Path to a PSS diagram for the RFS.
    ///
    /// **Important**: If this path is relative, it needs to be relative to the location
    ///                of the config file and will be joined onto the config file path.
    #[serde(deserialize_with = "deserialize_relative_path", alias = "rfs_diagram")]
    pub rfs_diagram_path: PathBuf,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct InfluxConfig {
    /// The address where the influx database is hosted.
    pub address: String,
    /// The organization to use on the influx database.
    pub organization: String,
    /// Name of the bucket where the datapoints should be uploaded to.
    pub bucket: String,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct TilesConfig {
    /// Description about the tile server.
    pub description: String,
    /// The kind of tiles the server provides.
    #[serde(flatten)]
    pub tile_kind: TileKind,
}

#[derive(Debug, Deserialize, Serialize, JsonSchema, ToSchema, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum TileKind {
    Raster {
        /// Template URL for fetching a raster tile (e.g., https://tile.openstreetmap.org/{z}/{x}/{y}.png).
        url: String,
    },
    Vector {
        /// Absolute URL to the location where the vector tiles are served (e.g., http://localhost:8888/data/test.pmtiles)
        url: String,
        /// Absolute URL to the location where the fonts for the vector layers are served (e.g., http://localhost:8888/fonts)
        fonts: String,
        /// Absolute URL to the location where the sprites for the vector layers are served (e.g., http://localhost:8888/sprites)
        sprites: String,
    },
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
