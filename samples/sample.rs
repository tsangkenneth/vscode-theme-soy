use std::collections::HashMap;
use std::fmt;

/// A word counter.
#[derive(Debug, Default)]
pub struct Counter {
    counts: HashMap<String, usize>,
}

pub enum Mode {
    Strict,
    Loose(u8),
}

pub trait Summary {
    fn summary(&self) -> String;
}

const LIMIT: usize = 1_000;

impl Counter {
    pub fn add(&mut self, text: &str) -> &mut Self {
        // Split on whitespace and count each word.
        for word in text.split_whitespace() {
            *self.counts.entry(word.to_lowercase()).or_insert(0) += 1;
        }
        self
    }
}

impl fmt::Display for Counter {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} words\n", self.counts.len())
    }
}

fn main() {
    let mut counter = Counter::default();
    counter.add("a b a");
    println!("{counter} {}", LIMIT > 0 && true);
}
