import type { ResumeData } from '../schema/resume.schema.js';

export interface OllamaGenerateOptions {
  model: string;
  baseUrl: string;
  jobDescription: string;
  resume: ResumeData;
}

export interface OllamaGenerateResult {
  bullets: [string, string];
  raw: string;
}

const FEW_SHOT_EXAMPLES = [
  'Co-developed event-driven data streaming pipelines in Python and Apache Kafka to securely ingest execution logs and agent telemetry from enterprise data lakes for AI governance.',
  "Implemented an automated 'LLM-as-a-Judge' evaluation framework in Python to systematically benchmark complaint summaries and compliance flags against ground truth datasets.",
  'Engineered document preprocessing pipelines with Docling and Unstructured.io to ingest 1,000+ unstructured candidate profiles, utilizing Redis semantic caching to achieve sub-second response latency.',
  'Created a Model Context Protocol (MCP) server on top of Neo4j with strict Pydantic validation, ensuring deterministic graph traversal and verifiable citations for legal contract reasoning.',
] as const;

function formatWorkHistory(resume: ResumeData): string {
  if (!resume.work.length) {
    throw new Error('Resume has no work history; cannot tailor cover-letter bullets.');
  }

  return resume.work
    .map((job) => {
      const lines = [
        `Company: ${job.name}`,
        `Role: ${job.position}`,
        `Dates: ${job.startDate}${job.endDate ? ` – ${job.endDate}` : ' – Present'}`,
      ];
      if (job.location) lines.push(`Location: ${job.location}`);
      if (job.summary) lines.push(`Summary: ${job.summary}`);
      if (job.highlights.length) {
        lines.push('Highlights:');
        for (const h of job.highlights) {
          lines.push(`  - ${h}`);
        }
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

function formatSkillsAndProjects(resume: ResumeData): string {
  const parts: string[] = [];

  if (resume.skills.length) {
    parts.push(
      'Skills:\n' +
        resume.skills
          .map((s) => `- ${s.name}: ${s.keywords.join(', ')}`)
          .join('\n'),
    );
  }

  if (resume.projects.length) {
    parts.push(
      'Projects:\n' +
        resume.projects
          .map((p) => {
            const bits = [`- ${p.name}`];
            if (p.description) bits.push(p.description);
            if (p.highlights.length) bits.push(`Highlights: ${p.highlights.join('; ')}`);
            if (p.keywords.length) bits.push(`Keywords: ${p.keywords.join(', ')}`);
            return bits.join(' | ');
          })
          .join('\n'),
    );
  }

  return parts.join('\n\n');
}

/** Build the anti-hallucination prompt for Ollama. */
export function buildCoverLetterBulletPrompt(
  resume: ResumeData,
  jobDescription: string,
): string {
  const workHistory = formatWorkHistory(resume);
  const secondary = formatSkillsAndProjects(resume);

  return `You are writing tailored cover-letter bullets for a European tech hiring application.

## HARD RULES (ZERO TOLERANCE)
1. Do NOT invent numbers, percentages, or metrics (e.g. never write "by 25%", "cut latency by 40%", "improved by 18%") unless that exact number/metric appears VERBATIM in the candidate background below.
2. Do NOT invent skills, tools, frameworks, or companies not present in the candidate background.
3. Outcome means architectural or operational impact: the functional capability delivered or architectural guarantee achieved — OR a metric that appears verbatim in the background.
4. Format each bullet as: Action (verb) + Stack (tools from background only) + Outcome (functional deliverable or real resume metric).
5. Output EXACTLY 2 bullet points. No preamble, no closing, no numbering beyond "- ".

## FEW-SHOT STYLE EXAMPLES (follow this tone and structure)
- ${FEW_SHOT_EXAMPLES[0]}
- ${FEW_SHOT_EXAMPLES[1]}
- ${FEW_SHOT_EXAMPLES[2]}
- ${FEW_SHOT_EXAMPLES[3]}

## TASK
Select the 2 most relevant engineering accomplishments from the candidate's background that directly address the core challenges in the Job Description. Output exactly 2 concise, professional bullet points following the Action + Stack + Outcome formula under the HARD RULES above.

## CANDIDATE WORK HISTORY
${workHistory}
${secondary ? `\n## ADDITIONAL GROUNDING (skills / projects — do not invent beyond these)\n${secondary}\n` : ''}
## JOB DESCRIPTION
${jobDescription.trim()}

## OUTPUT
Exactly 2 lines, each starting with "- ":`;
}

function stripBulletPrefix(line: string): string {
  return line
    .replace(/^[\s]*(?:[-*•]|\d+[.)])\s+/, '')
    .trim();
}

/** Parse model output into exactly two non-empty bullet strings. */
export function parseTwoBullets(raw: string): [string, string] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => stripBulletPrefix(l))
    .filter((l) => l.length > 0 && !/^(here|output|bullets|sure|certainly)\b/i.test(l));

  if (lines.length < 2) {
    // Fallback: split on sentence boundaries if model returned a paragraph
    const collapsed = raw.replace(/\s+/g, ' ').trim();
    const sentences = collapsed
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length >= 2) {
      return [sentences[0]!, sentences[1]!];
    }
    throw new Error(
      `Ollama did not return 2 bullets. Got ${lines.length} usable line(s). Raw response:\n${raw}`,
    );
  }

  return [lines[0]!, lines[1]!];
}

/**
 * Call local Ollama `/api/generate` and return exactly two cover-letter bullets.
 */
export async function generateCoverLetterBullets(
  options: OllamaGenerateOptions,
): Promise<OllamaGenerateResult> {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/api/generate`;
  const prompt = buildCoverLetterBulletPrompt(options.resume, options.jobDescription);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        prompt,
        stream: false,
      }),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot reach Ollama at ${url} (${detail}). Start Ollama (e.g. \`ollama serve\`) and pull the model (\`ollama pull ${options.model}\`).`,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Ollama returned HTTP ${response.status} from ${url}. ${body || 'Ensure the model is pulled:'} \`ollama pull ${options.model}\`.`,
    );
  }

  const payload = (await response.json()) as { response?: string };
  const raw = payload.response?.trim() ?? '';
  if (!raw) {
    throw new Error(
      `Ollama returned an empty response for model "${options.model}". Try \`ollama pull ${options.model}\` or another --model.`,
    );
  }

  const bullets = parseTwoBullets(raw);
  return { bullets, raw };
}
