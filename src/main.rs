use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware, web::Data};
use clap::Parser;
use env_logger::Env;

use crate::{cli::Cli, web::broadcast::Broadcast};

mod cli;
mod web;

#[tokio::main]
async fn main() {
    env_logger::init_from_env(Env::new().default_filter_or("info"));
    let cli = Cli::parse();

    let broadcast = Broadcast::new();

    HttpServer::new(move || {
        let cors = Cors::default().allow_any_header().allow_any_method().allow_any_origin();
        App::new()
            .wrap(cors)
            .app_data(Data::from(broadcast.clone()))
            .wrap(middleware::Logger::default())
            .service(web::info)
            .service(web::subscribe_events)
    })
    .bind((cli.address, cli.port))
    .expect("should be able to bind to address and port")
    .run()
    .await
    .expect("should start web server");
}
