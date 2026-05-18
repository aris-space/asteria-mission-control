use std::path::Path;
use std::process::exit;
use std::time::Duration;

use asteria_messages::Message;
use clap::Parser;
use env_logger::Env;
use mavlink_lib::MavlinkSender;
use serde::Deserialize;
use tokio::fs::File;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::cli::Cli;

mod cli;

/// MavLink ID of the replay "remote computer".
const MAVLINK_SYSTEM_ID: u8 = 202;

#[derive(Deserialize, Clone)]
struct LoggedMessage {
    #[serde(flatten)]
    message: Message,
    timestamp: u64,
}

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    let file = File::open(&cli.path).await.unwrap_or_else(|err| {
        log::error!("Unable to open log file at '{}': {err}", cli.path);
        exit(1)
    });

    let path = Path::new(&cli.path).canonicalize().unwrap_or_else(|err| {
        log::error!("Unable to canonicalize log file path: {err}");
        exit(1)
    });

    log::info!("Using log file at '{}'", path.display());

    let (mavlink_sender, _mavlink_receiver) = mavlink_lib::tx_rx(MAVLINK_SYSTEM_ID, cli.mavlink_address.into());

    let reader = BufReader::new(file);
    let mut lines = reader.lines();
    let mut line_number = 0;

    let mut logged_messages = Vec::new();

    while let Ok(Some(line)) = lines.next_line().await {
        line_number += 1;

        if line.is_empty() {
            continue;
        }

        let current = serde_json::from_str::<LoggedMessage>(&line).unwrap_or_else(|err| {
            log::error!("Line {line_number} is not a valid logged message: {err}");
            exit(1)
        });
        logged_messages.push(current);
    }

    log::info!("Starting replay of {} messages", logged_messages.len());
    replay(&mavlink_sender, &logged_messages).await;

    if cli.repeat {
        loop {
            log::info!("Restarting replay of {} messages", logged_messages.len());
            replay(&mavlink_sender, &logged_messages).await;
            tokio::time::sleep(Duration::from_millis(cli.repeat_timeout_ms)).await;
        }
    }
}

async fn replay(sender: &MavlinkSender, messages: &[LoggedMessage]) {
    let mut last = Option::<u64>::None;
    for current in messages {
        let last_timestamp = match last {
            Some(ts) => ts,
            // For the first message return the timestamp of the current message.
            None => current.timestamp,
        };

        // Change the timestamp of the last message to the current message timestamp.
        last.replace(current.timestamp);

        // Duration between the current message and the last message.
        let timeout = Duration::from_millis(current.timestamp - last_timestamp);
        tokio::time::sleep(timeout).await;

        if let Err(err) = sender.send(&current.message).await {
            log::warn!("Unable to send MavLink message: {err}");
        }
    }
}
