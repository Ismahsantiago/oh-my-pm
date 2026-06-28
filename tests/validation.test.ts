import { describe, expect, it } from "vitest"
import { buildInitialManifest } from "../src/utils/manifest.js"
import { checkMermaidSyntax, validateManifestData } from "../src/utils/validation.js"

describe("manifest validation", () => {
  it("accepts the initial PM-Harness manifest when required fields are present", () => {
    const manifest = buildInitialManifest("example-product", "2026-06-27T00:00:00.000Z")

    const report = validateManifestData(manifest)

    expect(report.ok).toBe(true)
    expect(report.issues).toHaveLength(0)
  })

  it("rejects invalid lifecycle status values", () => {
    const validManifest = buildInitialManifest("example-product", "2026-06-27T00:00:00.000Z")
    const manifest = {
      $schema: validManifest.$schema,
      project_metadata: {
        name: validManifest.project_metadata.name,
        blueprint_version: validManifest.project_metadata.blueprint_version,
        status: "planning",
        generated_by: validManifest.project_metadata.generated_by,
        generated_at: validManifest.project_metadata.generated_at,
      },
      product_blueprints: validManifest.product_blueprints,
      execution_dag: validManifest.execution_dag,
      feedback_channel: validManifest.feedback_channel,
    }

    const report = validateManifestData(manifest)

    expect(report.ok).toBe(false)
    expect(report.issues.map((item) => item.code)).toContain("invalid_status")
  })

  it("checks Mermaid sources by supported diagram prefix", () => {
    expect(checkMermaidSyntax("flowchart TD\nA --> B").ok).toBe(true)
    expect(checkMermaidSyntax("plain text").ok).toBe(false)
  })
})
