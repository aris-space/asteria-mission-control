fn main() {
    set_git_version();
}

/// Set the `GIT_VERSION` environment variable to the current git tag and commit
/// and `GIT_VERSION_FULL` which also contains the latest git commit message
/// in addition to the git tag and commit
fn set_git_version() {
    let version = match std::process::Command::new("git").args(["describe", "--long", "--abbrev=7", "--tags"]).output() {
        Ok(output) => {
            if output.status.success() {
                let str = String::from_utf8_lossy(&output.stdout);
                let split = str.trim().split('-').collect::<Vec<_>>();
                format!("{}-r{}-{}", &split[0][1..], split[1], split[2])
            } else {
                println!("cargo::warning=Unable to get git version: {}", String::from_utf8_lossy(&output.stderr));
                String::from("unknown")
            }
        }
        Err(err) => {
            println!("cargo::warning=Unable to get git version: {err:#}");
            String::from("unknown")
        }
    };

    let commit = match std::process::Command::new("git").arg("log").arg("--format=[%s]").arg("-n").arg("1").output() {
        Ok(output) => {
            if output.stdout.is_empty() {
                String::from("unknown")
            } else {
                String::from_utf8_lossy(&output.stdout).trim().to_string()
            }
        }
        Err(err) => {
            println!("cargo::warning=Unable to get latest git commit: {err:#}");
            String::from("unknown")
        }
    };

    println!("cargo::rustc-env=GIT_VERSION={version}");
    println!("cargo::rustc-env=GIT_VERSION_FULL={version} {commit}");
}