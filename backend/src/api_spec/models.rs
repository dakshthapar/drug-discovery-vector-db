use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiSpec {
    pub service: String,
    pub version: String,
    pub endpoints: Vec<EndpointSpec>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EndpointSpec {
    pub name: String,
    pub method: String,
    pub path: String,
    pub description: String,
    #[serde(default)]
    pub path_params: Vec<ParamSpec>,
    #[serde(default)]
    pub query_params: Vec<ParamSpec>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_body: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_body: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub example_request: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub example_response: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParamSpec {
    pub name: String,
    pub r#type: String,
    pub required: bool,
    pub description: Option<String>,
}
