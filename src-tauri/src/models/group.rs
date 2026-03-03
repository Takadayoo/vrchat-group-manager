use serde::{Deserialize, Serialize};
use std::fmt;

/// グループメンバーの可視状態
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum GroupMemberVisibility {
    Visible,
    Friends,
    Hidden,
}

impl fmt::Display for GroupMemberVisibility {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Visible => write!(f, "visible"),
            Self::Friends => write!(f, "friends"),
            Self::Hidden => write!(f, "hidden"),
        }
    }
}

/// VRChatグループ情報（API生レスポンス）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VRCGroup {
    pub name: String,
    pub description: String,
    #[serde(rename = "iconUrl")]
    pub icon_url: Option<String>,
    #[serde(rename = "memberCount")]
    pub member_count: Option<i32>,
    #[serde(rename = "groupId")]
    pub group_id: String,
    #[serde(rename = "memberVisibility")]
    pub member_visibility: GroupMemberVisibility,
    #[serde(rename = "isRepresenting")]
    pub is_representing: Option<bool>,
}

/// フロントエンドに返すグループDTO
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupResponse {
    pub name: String,
    pub description: String,
    pub member_visibility: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_url: Option<String>,
    pub group_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub member_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_representing: Option<bool>,
}

/// VRCGroupをGroupResponseに変換
pub fn group_to_response(group: VRCGroup) -> GroupResponse {
    GroupResponse {
        name: group.name,
        description: group.description,
        icon_url: group.icon_url,
        member_count: group.member_count,
        group_id: group.group_id,
        member_visibility: match group.member_visibility {
            GroupMemberVisibility::Visible => "visible".to_string(),
            GroupMemberVisibility::Friends => "friends".to_string(),
            GroupMemberVisibility::Hidden => "hidden".to_string(),
        },
        is_representing: group.is_representing,
    }
}
