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
    /// Configuration related to the map displayed on the frontend.
    pub map: MapConfig,
    /// Location of the ground station (i.e. the mission control itself).
    pub ground_station: GroundStationConfig,
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
pub struct MapConfig {
    /// Available tile servers for the mission control.
    pub tiles: BTreeMap<String, TilesConfig>,
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

#[derive(Debug, Deserialize, Serialize, JsonSchema, ToSchema, Clone, PartialEq)]
pub struct GroundStationConfig {
    /// A short, human-readable name of the ground station location.
    pub name: String,
    /// Latitude in degrees (WGS84). Range: -90.0° to +90.0°
    #[serde(alias = "lat", deserialize_with = "deserialize_latitude")]
    pub latitude: f64,
    /// Longitude in degrees (WGS84). Range: -180.0° to +180.0°
    #[serde(alias = "lon", alias = "lng", deserialize_with = "deserialize_longitude")]
    pub longitude: f64,
}

/// Deserialize a finite [`f64`] which lies within `min..=max`.
fn deserialize_in_range<'de, D>(deserializer: D, name: &str, min: f64, max: f64) -> Result<f64, D::Error>
where
    D: Deserializer<'de>,
{
    let value = f64::deserialize(deserializer)?;
    if !value.is_finite() || !(min..=max).contains(&value) {
        return Err(serde::de::Error::custom(format!("{name} {value} is not within {min} to {max}")));
    }
    Ok(value)
}

fn deserialize_latitude<'de, D: Deserializer<'de>>(deserializer: D) -> Result<f64, D::Error> {
    deserialize_in_range(deserializer, "Latitude", -90.0, 90.0)
}

fn deserialize_longitude<'de, D: Deserializer<'de>>(deserializer: D) -> Result<f64, D::Error> {
    deserialize_in_range(deserializer, "Longitude", -180.0, 180.0)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, Deserialize)]
    struct Wrapper {
        ground_station: GroundStationConfig,
    }

    #[test]
    fn parse_ground_station() {
        let config = toml::from_str::<Wrapper>(
            r#"
[ground_station]
name = "Dübendorf"
latitude = 47.405831
longitude = 8.631848
"#,
        )
        .unwrap();

        assert_eq!(
            config.ground_station,
            GroundStationConfig { name: "Dübendorf".into(), latitude: 47.405831, longitude: 8.631848 }
        );
    }

    #[test]
    fn parse_ground_station_aliases() {
        let config = toml::from_str::<Wrapper>(
            r#"
[ground_station]
name = "Dübendorf"
lat = 47.405831
lon = 8.631848
"#,
        )
        .unwrap();

        assert_eq!(config.ground_station.latitude, 47.405831);
        assert_eq!(config.ground_station.longitude, 8.631848);
    }

    #[test]
    fn reject_out_of_range_ground_station() {
        for (lat, lon) in [("91.0", "8.0"), ("47.0", "-180.5"), ("nan", "8.0")] {
            let config = format!("[ground_station]\nname = \"x\"\nlatitude = {lat}\nlongitude = {lon}\n");
            assert!(toml::from_str::<Wrapper>(&config).is_err(), "should reject {config}");
        }
    }

    #[test]
    fn reject_missing_ground_station() {
        assert!(toml::from_str::<Wrapper>("").is_err());
    }
}
