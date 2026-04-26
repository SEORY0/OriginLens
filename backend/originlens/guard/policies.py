from __future__ import annotations

from dataclasses import dataclass
from typing import get_args

from originlens.schemas import Origin, ProtectedAction

KNOWN_PROTECTED_ACTIONS = frozenset(get_args(ProtectedAction))
KNOWN_ORIGINS = frozenset(get_args(Origin))


def _assert_known_origins(origins: tuple[Origin, ...], field_name: str) -> None:
    unknown_origins = sorted(set(origins) - KNOWN_ORIGINS)
    if unknown_origins:
        raise ValueError(f"{field_name} contains unknown origins: {unknown_origins}.")


def _duplicates(origins: tuple[Origin, ...]) -> list[Origin]:
    seen: set[Origin] = set()
    duplicates: list[Origin] = []
    for origin in origins:
        if origin in seen and origin not in duplicates:
            duplicates.append(origin)
        seen.add(origin)
    return duplicates


@dataclass(frozen=True)
class PolicyRule:
    label: str
    required_origins: tuple[Origin, ...] = ()
    denied_origins: tuple[Origin, ...] = ()
    confirmation_required: bool = False

    def __post_init__(self) -> None:
        required_origins = tuple(self.required_origins)
        denied_origins = tuple(self.denied_origins)
        object.__setattr__(self, "required_origins", required_origins)
        object.__setattr__(self, "denied_origins", denied_origins)

        if not self.label.strip():
            raise ValueError("PolicyRule label cannot be empty.")

        _assert_known_origins(required_origins, "required_origins")
        _assert_known_origins(denied_origins, "denied_origins")

        duplicate_required = _duplicates(required_origins)
        duplicate_denied = _duplicates(denied_origins)
        if duplicate_required:
            raise ValueError(f"{self.label} repeats required origins: {duplicate_required}.")
        if duplicate_denied:
            raise ValueError(f"{self.label} repeats denied origins: {duplicate_denied}.")

        overlapping_origins = sorted(set(required_origins) & set(denied_origins))
        if overlapping_origins:
            raise ValueError(
                f"{self.label} has origins that are both required and denied: "
                f"{overlapping_origins}."
            )


POLICY_MATRIX: dict[ProtectedAction, PolicyRule] = {
    "sandbox_policy_change": PolicyRule(
        label="Sandbox Policy Change",
        required_origins=("system", "user"),
        denied_origins=("file_read", "image_ocr", "tool_output"),
    ),
    "external_transmission": PolicyRule(
        label="External Transmission",
        required_origins=("user",),
        denied_origins=("file_read", "image_ocr", "sensor_input"),
        confirmation_required=True,
    ),
    "memory_policy_write": PolicyRule(
        label="Memory Policy Write",
        required_origins=("system", "user"),
        denied_origins=("file_read", "tool_output"),
    ),
    "physical_restricted_zone_entry": PolicyRule(
        label="Physical Restricted Zone Entry",
        required_origins=("authenticated_operator", "safety_controller"),
        denied_origins=("image_ocr", "sensor_input"),
    ),
    "none": PolicyRule(
        label="Unprotected Action",
    ),
}


def policy_for(protected_action: ProtectedAction) -> PolicyRule:
    return POLICY_MATRIX[protected_action]


def validate_policy_matrix(matrix: dict[ProtectedAction, PolicyRule]) -> None:
    missing_actions = sorted(KNOWN_PROTECTED_ACTIONS - set(matrix))
    extra_actions = sorted(set(matrix) - KNOWN_PROTECTED_ACTIONS)
    if missing_actions:
        raise ValueError(f"Policy matrix is missing protected actions: {missing_actions}.")
    if extra_actions:
        raise ValueError(f"Policy matrix contains unknown protected actions: {extra_actions}.")

    for action, policy in matrix.items():
        if action == "none":
            if policy.required_origins or policy.denied_origins or policy.confirmation_required:
                raise ValueError("Unprotected action policy must not require guard origins.")
            continue

        if not policy.required_origins:
            raise ValueError(f"{policy.label} must define at least one required origin.")


validate_policy_matrix(POLICY_MATRIX)
