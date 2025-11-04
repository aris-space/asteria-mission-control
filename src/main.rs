use actix_web::{App, HttpServer, middleware};
use clap::Parser;
use env_logger::Env;

use crate::cli::Cli;

pub mod cli;
pub mod endpoints;

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    HttpServer::new(move || App::new().wrap(middleware::Logger::default()).service(endpoints::info))
        .bind((cli.address, cli.port))
        .expect("should be able to bind to address and port")
        .run()
        .await
        .expect("should start web server");
}
