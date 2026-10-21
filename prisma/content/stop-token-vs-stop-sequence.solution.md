## Definitions

- **Stop token:** a **single special token ID** in the model's vocabulary (EOS, end-of-turn). It is part of the model, learned during training, and emitted by the model itself to say "I'm done".
- **Stop sequence:** an arbitrary **string** (such as `"\n\nUser:"`, `"Observation:"`, `"###"`, `"</answer>"`) supplied **by the caller** at request time. Generation halts as soon as the generated text contains it.

## Comparison

| | Stop token | Stop sequence |
|---|---|---|
| Defined by | Model and tokenizer (training) | Application developer (per request) |
| Form | One token ID | Any text; may span several tokens |
| Detected on | Token IDs, at each step | **Decoded text**, checked as it grows |
| Reflects model's intention | Yes, the model chooses to end | No, an external rule cuts the output |
| Appears in output | Not returned | Usually **trimmed**, often optional to include |
| Changes per request | No | Yes |
| Cost to check | Trivial integer compare | Needs detokenised text; handle partial matches |

## Implementation details for stop sequences

- A sequence can be produced **across token boundaries**, so the engine matches on the running decoded string, not on individual tokens.
- When **streaming**, the engine must **hold back** a few characters that could be the start of a stop sequence so that it never shows text the user later must not see.
- Several stop sequences can be given; the first one to appear wins.
- The matched string is removed from the final result.

## Use cases for stop sequences

- **ReAct agents:** stop at `Observation:` so the model does not invent tool results. The application runs the real tool, appends the real observation and continues.
- **Few-shot or completion-style prompts:** stop at the delimiter between examples (`\n###`).
- **Structured output:** stop at a closing tag such as `</json>`.
- **Preventing the model from writing the next user turn** in raw-completion models.
- **Controlling length** of list-like output by stopping at a marker.

## Pitfalls

- A stop sequence that occurs legitimately in the answer truncates it silently.
- Whitespace and tokenisation matter: `"\nUser:"` and `"User:"` are different strings.
- Stop sequences do not replace the model's own EOS handling; both are normally active, plus the `max_tokens` backstop.

**One-line summary:** a stop token is the model saying it is finished; a stop sequence is the developer telling the engine to cut off when a given text appears.
