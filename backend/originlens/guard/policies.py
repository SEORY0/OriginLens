from __future__ import annotations

from dataclasses import dataclass

from originlens.schemas import Origin, ProtectedAction


@dataclass(frozen=True)
class PolicyRule:
    label: str
    required_origins: list[Origin]
    denied_origins: list[Origin]
    confirmation_required: bool = False


POLICY_MATRIX: dict[ProtectedAction, PolicyRule] = {
    "sandbox_policy_change": PolicyRule(
        label="Sandbox Policy Change",
        required_origins=["system", "user"],
        denied_origins=["file_read", "image_ocr", "tool_output"],
    ),
    "external_transmission": PolicyRule(
        label="External Transmission",
        required_origins=["user"],
        denied_origins=["file_read", "image_ocr", "sensor_input"],
        confirmation_required=True,
    ),
    "memory_policy_write": PolicyRule(
        label="Memory Policy Write",
        required_origins=["system", "user"],
        denied_origins=["file_read", "tool_output"],
    ),
    "physical_restricted_zone_entry": PolicyRule(
        label="Physical Restricted Zone Entry",
        required_origins=["authenticated_operator", "safety_controller"],
        denied_origins=["image_ocr", "sensor_input"],
    ),
    "none": PolicyRule(
        label="Unprotected Action",
        required_origins=[],
        denied_origins=[],
    ),
}
