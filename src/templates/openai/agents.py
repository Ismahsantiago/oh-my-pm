from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal
import json

from agents import Agent, function_tool, handoff

ManifestStatus = Literal["discovery", "designed", "approved", "in_development", "blocked", "completed"]


@dataclass(frozen=True)
class PMContext:
    project_root: Path
    manifest_path: Path


AGENT_PRINCIPLES = """
Principles: lane specialization, verification before completion, manifest-only communication,
full context on delegation, and technical honesty through blockers instead of guesses.
""".strip()


@function_tool
def read_pm_manifest(project_root: str) -> str:
    """Read .pm/pm_manifest.json for Oh My PM and Dev-Harness coordination."""
    manifest_path = Path(project_root) / ".pm" / "pm_manifest.json"
    return manifest_path.read_text(encoding="utf-8")


@function_tool
def write_pm_manifest(project_root: str, manifest_json: str) -> str:
    """Write a validated Oh My PM manifest JSON payload to .pm/pm_manifest.json."""
    parsed = json.loads(manifest_json)
    manifest_path = Path(project_root) / ".pm" / "pm_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(parsed, indent=2) + "
", encoding="utf-8")
    return str(manifest_path)


@function_tool
def write_pm_artifact(project_root: str, relative_path: str, content: str) -> str:
    """Write a Oh My PM artifact such as docs/prd.md, docs/trd.md, or docs/flows/main-flow.md."""
    target = Path(project_root) / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    return str(target)


hammurabi = Agent(
    name="pm_hammurabi",
    model="gpt-4.1",
    handoff_description="PRD specialist for requirements, business rules, and acceptance criteria.",
    instructions=(
        "You are Hammurabi, the Oh My PM PRD specialist. Write docs/prd.md with problem, "
        "audience, scope, user stories, requirements, and acceptance criteria. "
        f"{AGENT_PRINCIPLES}"
    ),
    tools=[read_pm_manifest, write_pm_artifact, write_pm_manifest],
)

davinci = Agent(
    name="pm_davinci",
    model="gpt-4.1",
    handoff_description="UX flow specialist for journeys, screens, and Mermaid diagrams.",
    instructions=(
        "You are DaVinci, the Oh My PM UX flow specialist. Write docs/flows/main-flow.md "
        "with Mermaid diagrams, screen states, and journey notes. "
        f"{AGENT_PRINCIPLES}"
    ),
    tools=[read_pm_manifest, write_pm_artifact, write_pm_manifest],
)

ada = Agent(
    name="pm_ada",
    model="gpt-4.1",
    handoff_description="Technical design specialist for TRD, API, database, and schemas.",
    instructions=(
        "You are Ada, the Oh My PM technical design specialist. Write docs/trd.md and "
        "docs/db-schema.md with architecture, APIs, data model, security, and constraints. "
        f"{AGENT_PRINCIPLES}"
    ),
    tools=[read_pm_manifest, write_pm_artifact, write_pm_manifest],
)

suntzu = Agent(
    name="pm_suntzu",
    model="gpt-5.4-ultra",
    handoff_description="Execution strategist for DAG, dependencies, and Dev-Harness handoff.",
    instructions=(
        "You are SunTzu, the Oh My PM execution strategist. Write docs/execution-plan.md "
        "and update execution_dag.tasks in the manifest. "
        f"{AGENT_PRINCIPLES}"
    ),
    tools=[read_pm_manifest, write_pm_artifact, write_pm_manifest],
)

jc = Agent(
    name="pm_jc",
    model="gpt-5.4-ultra",
    instructions=(
        "You are JC, the Oh My PM orchestrator. Run discovery, delegate complete context, "
        "validate all artifacts, and ask for explicit user approval before status approved. "
        f"{AGENT_PRINCIPLES}"
    ),
    tools=[read_pm_manifest, write_pm_manifest],
    handoffs=[
        handoff(hammurabi),
        handoff(davinci),
        handoff(ada),
        handoff(suntzu),
    ],
)

OH_MY_PM_AGENTS = {
    "jc": jc,
    "hammurabi": hammurabi,
    "davinci": davinci,
    "ada": ada,
    "suntzu": suntzu,
}
