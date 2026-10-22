// Metadata for the question bank.
// Question text lives in content/<topic-slug>/<slug>.question.md and the reference solution in content/<topic-slug>/<slug>.solution.md.
// Edit those Markdown files to curate content, then run `npx prisma db seed` again (it upserts by slug).

const ROLES = { ai: 'AI Engineer', ml: 'ML Engineer', genai: 'GenAI Engineer' };

const topics = [
  { slug: 'ml-fundamentals', name: 'Machine Learning Fundamentals', description: 'Core concepts, metrics, and model behaviour.' },
  { slug: 'deep-learning', name: 'Deep Learning', description: 'Neural networks, optimisation, and architectures.' },
  { slug: 'python-for-ai-ml', name: 'Python for AI/ML', description: 'Python language details that matter in ML code.' },
  { slug: 'statistics-and-mathematics', name: 'Statistics and Mathematics', description: 'Probability, inference, and experimentation.' },
  { slug: 'generative-ai-and-llms', name: 'Generative AI and LLMs', description: 'Transformers, prompting, and LLM behaviour.' },
  { slug: 'rag-and-vector-databases', name: 'RAG and Vector Databases', description: 'Retrieval pipelines, embeddings, and grounding.' },
  { slug: 'ai-agents-and-tool-calling', name: 'AI Agents and Tool Calling', description: 'Agent design, tools, and failure modes.' },
  { slug: 'ml-system-design', name: 'ML System Design', description: 'Designing ML systems end to end.' },
  { slug: 'production-ai-engineering', name: 'Production AI Engineering', description: 'Monitoring, drift, cost, and reliability.' },
  { slug: 'ai-engineering-case-studies', name: 'AI Engineering Case Studies', description: 'Realistic scenarios with trade-offs.' },
];

const problems = [
  {
    slug: 'bias-variance-tradeoff', title: 'Explain the bias-variance trade-off', topic: 'ml-fundamentals',
    subcategory: 'Generalisation', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 6,
    roles: [ROLES.ml, ROLES.ai], allowDirectReveal: true,
    hints: ['Think about what changes if you train on a different random sample.', 'What do learning curves look like in each failure case?'],
    related: ['precision-recall-imbalanced'],
  },
  {
    slug: 'precision-recall-imbalanced', title: 'Choosing metrics for an imbalanced fraud model', topic: 'ml-fundamentals',
    subcategory: 'Evaluation', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What accuracy does a model that always predicts "not fraud" get?', 'Who pays the cost of a false negative versus a false positive?'],
    related: ['bias-variance-tradeoff', 'ab-test-p-value'],
  },
  {
    slug: 'vanishing-gradients', title: 'Why do gradients vanish in deep networks?', topic: 'deep-learning',
    subcategory: 'Optimisation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Write the gradient for an early layer as a product of per-layer terms.', 'What is the maximum value of the sigmoid derivative?'],
    related: ['self-attention-explained'],
  },
  {
    slug: 'mutable-default-argument', title: 'Debug a function that remembers state between calls', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 5,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['When is a default argument expression evaluated?'],
    related: [],
  },
  {
    slug: 'self-attention-explained', title: 'Explain scaled dot-product attention', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml],
    hints: ['What do queries, keys and values represent?', 'What happens to softmax when the inputs have a large magnitude?'],
    related: ['vanishing-gradients'],
  },
  {
    slug: 'reduce-rag-hallucinations', title: 'How would you reduce hallucinations in a RAG application?', topic: 'rag-and-vector-databases',
    subcategory: 'Reliability', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Before changing anything, how would you tell a retrieval failure from a generation failure?', 'What would you log for every request?'],
    related: ['agent-calls-wrong-tool', 'design-document-qa-system'],
  },
  {
    slug: 'agent-calls-wrong-tool', title: 'Debug an agent that keeps calling the wrong tool', topic: 'ai-agents-and-tool-calling',
    subcategory: 'Debugging agents', difficulty: 'HARD', type: 'DEBUGGING', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Read the tool descriptions as the model sees them. Are they distinguishable?', 'What does the tool return when it finds nothing?', 'Which tool here has real-world side effects?'],
    related: ['reduce-rag-hallucinations'],
  },
  {
    slug: 'design-document-qa-system', title: 'Design a question-answering system over 10 million internal documents', topic: 'ml-system-design',
    subcategory: 'Retrieval systems', difficulty: 'HARD', type: 'SYSTEM_DESIGN', estimatedMinutes: 30,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Start with requirements: latency, freshness, and who is allowed to see what.', 'Estimate the index size before choosing a vector store.'],
    related: ['reduce-rag-hallucinations', 'model-degradation-after-deployment'],
  },
  {
    slug: 'model-degradation-after-deployment', title: 'A deployed model got worse three months after launch', topic: 'production-ai-engineering',
    subcategory: 'Monitoring and drift', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 15,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Rule out boring causes such as broken pipelines before assuming drift.', 'What if ground-truth labels arrive weeks late?'],
    related: ['ab-test-p-value', 'design-document-qa-system'],
  },
  {
    slug: 'ab-test-p-value', title: 'Interpret an A/B test result for a new ranking model', topic: 'statistics-and-mathematics',
    subcategory: 'Experimentation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What exactly does a p-value condition on?', 'What happens to false positives if you check the result every day?'],
    related: ['precision-recall-imbalanced', 'model-degradation-after-deployment'],
  },
    {
    slug: 'irrelevant-retrieval-rag', title: 'Diagnose irrelevant retrieval results in a RAG pipeline', topic: 'rag-and-vector-databases',
    subcategory: 'Retrieval quality', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Where does the right chunk rank, and how far apart are the scores?', 'What does the system already know about the user that the retriever ignores?'],
    related: ['reduce-rag-hallucinations', 'design-document-qa-system'],
    challenge: {
      steps: [
        { title: 'Read the evidence', prompt: 'What do the trace and configuration tell you? List the specific problems you can see.' },
        { title: 'Hypotheses and tests', prompt: 'Rank the likely root causes and give the cheapest experiment that would confirm or reject each.' },
        { title: 'Fix', prompt: 'Which changes would you make, in what order, and why?' },
        { title: 'Measure and monitor', prompt: 'How would you prove the fix works and stop it regressing?' },
      ],
      rubric: [
        { id: 'r1', weight: 15, criterion: 'Reads the trace: the right chunk is only rank 3, scores are tightly clustered (0.77 to 0.81), and results mix countries and document types.' },
        { id: 'r2', weight: 15, criterion: 'Identifies the missing metadata filter (the user country is known and the index has a country field) as a likely root cause.' },
        { id: 'r3', weight: 15, criterion: 'Examines chunking (1500 characters, no overlap, headings dropped) and proposes structure-aware chunks or context headers.' },
        { id: 'r4', weight: 15, criterion: 'Proposes hybrid retrieval (keyword plus dense) and/or a reranker, with a reason tied to the data.' },
        { id: 'r5', weight: 20, criterion: 'Builds or uses a labelled retrieval eval set and measures recall@k or MRR before and after, changing one thing at a time.' },
        { id: 'r6', weight: 10, criterion: 'Separates retrieval from generation and checks retrieval before touching prompts or the LLM.' },
        { id: 'r7', weight: 10, criterion: 'Discusses trade-offs and production monitoring (reranker latency and cost, reindexing, tracking recall and no-good-context rate).' },
      ],
      assets: [
        {
          title: 'Retrieval trace for one failing query', kind: 'log',
          content: `query:      "how many days of paternity leave do I get?"
user:       employee_id=E-20417  country=IN
retriever:  dense, top_k=5, filters=none, reranker=none

rank  score  source             location         chunk text (start)
1     0.81   hr_policy_us.pdf   p4  chunk 3      "Maternity leave: eligible employees receive 12 weeks ..."
2     0.80   hr_policy_in.pdf   p9  chunk 1      "Leave types: casual, sick and earned leave accrue ..."
3     0.79   hr_policy_in.pdf   p11 chunk 2      "Paternity leave: 15 working days, to be taken within ..."
4     0.78   hr_faq.docx        chunk 7          "Parental leave FAQ: see the policy for your region ..."
5     0.77   hr_policy_uk.pdf   p6  chunk 4      "Shared parental leave allows parents to share up to ..."

generated answer: "Eligible employees receive 12 weeks of leave."`,
        },
        {
          title: 'Index and retriever configuration', kind: 'json',
          content: `{
  "chunking": { "strategy": "fixed", "size_chars": 1500, "overlap_chars": 0, "keeps_headings": false },
  "embedding": { "model": "general-purpose-embedder", "dimensions": 768 },
  "index": { "documents": 312, "chunks": 9840, "metadata_fields": ["source", "page", "country", "doc_type"] },
  "retriever": { "type": "dense", "top_k": 5, "filters": null, "reranker": null },
  "offline_eval": { "labelled_queries": 40, "recall_at_5": 0.55, "mrr": 0.38 }
}`,
        },
      ],
    },
  },
  {
    slug: 'reduce-llm-inference-cost', title: 'Cut LLM inference costs without hurting answer quality', topic: 'production-ai-engineering',
    subcategory: 'Cost and efficiency', difficulty: 'MEDIUM', type: 'CASE_STUDY', estimatedMinutes: 20,
    roles: [ROLES.ai, ROLES.genai],
    hints: ['Work out which part of the bill is input and which is output before choosing a technique.', 'What is identical across requests? What repeats?'],
    related: ['high-latency-llm-app', 'model-degradation-after-deployment'],
    challenge: {
      steps: [
        { title: 'Where the money goes', prompt: 'Use the usage data to estimate the daily cost and break it down.' },
        { title: 'Options and savings', prompt: 'List the changes you would consider, with a rough savings estimate for each.' },
        { title: 'Protect quality', prompt: 'How would you make sure quality does not drop by more than the allowed amount?' },
        { title: 'Roll out and monitor', prompt: 'How would you ship this safely and keep an eye on it afterwards?' },
      ],
      rubric: [
        { id: 'r1', weight: 15, criterion: 'Computes or estimates the cost split from the data (input about 696M tokens/day vs output about 50M, with output priced 5x higher) and finds the biggest lever.' },
        { id: 'r2', weight: 15, criterion: 'Reduces repeated input: caches or shortens the 1,900-token identical system prompt, trims retrieved context (top_k), or compresses history.' },
        { id: 'r3', weight: 20, criterion: 'Routes the simple, repetitive intents (62% of traffic) to a smaller or cheaper model, with a fallback to the large model.' },
        { id: 'r4', weight: 10, criterion: 'Considers response caching for repeated FAQ-style questions, including freshness, invalidation and privacy limits.' },
        { id: 'r5', weight: 20, criterion: 'Protects quality: labelled eval set, offline comparison, shadow or A/B test, per-intent metrics, and a rule tied to the 2-point thumbs-up limit.' },
        { id: 'r6', weight: 10, criterion: 'Quantifies expected savings with stated assumptions instead of only naming techniques.' },
        { id: 'r7', weight: 10, criterion: 'Discusses trade-offs and rollout: router errors, staleness, complexity, gradual rollout, alerts and a rollback plan.' },
      ],
      assets: [
        {
          title: 'Usage report (last 7 days)', kind: 'log',
          content: `assistant-prod | every request uses the same large model
price (illustrative): $3.00 per 1M input tokens, $15.00 per 1M output tokens

requests per day                    120,000
avg input tokens per request          5,800
  system prompt                       1,900   (identical on every request)
  retrieved context                   3,200   (top_k = 8)
  conversation history                  600
  user message                          100
avg output tokens per request           420
response cache hit rate                  0%
p95 latency                           6.1 s
thumbs-up rate                          81%

constraint: thumbs-up rate must not drop by more than 2 points`,
        },
        {
          title: 'Request mix by intent', kind: 'log',
          content: `intent                              share   avg output tokens   thumbs-up
order status                         24%         90                 92%
returns and refund policy            18%        150                 88%
shipping times                       12%        110                 90%
account and password help             8%        130                 86%
(top four intents together)          62%
everything else (open-ended,
  multi-step, complaints)            38%        780                 71%`,
        },
      ],
    },
  },
  {
    slug: 'high-latency-llm-app', title: 'Diagnose high latency in an LLM chat application', topic: 'production-ai-engineering',
    subcategory: 'Latency', difficulty: 'HARD', type: 'DEBUGGING', estimatedMinutes: 25,
    roles: [ROLES.ai, ROLES.genai],
    hints: ['Add up the spans and work out each one\'s share of the total.', 'Separate time to first token from total time. Which one do users feel?'],
    related: ['reduce-llm-inference-cost', 'irrelevant-retrieval-rag'],
    challenge: {
      steps: [
        { title: 'Read the trace', prompt: 'Where does the time go? Give each major span\'s share of the total.' },
        { title: 'Prioritise', prompt: 'Which problems would you tackle first, and why?' },
        { title: 'Fixes and expected impact', prompt: 'For each fix, say what changes and roughly how much time it saves.' },
        { title: 'Verify and guard', prompt: 'How would you confirm the improvement and stop latency creeping back?' },
      ],
      rubric: [
        { id: 'r1', weight: 15, criterion: 'Sums the trace (about 10.1 s) and names the biggest spans with shares: generation about 41%, first token about 23%, rerank about 19%.' },
        { id: 'r2', weight: 20, criterion: 'Enables streaming and distinguishes perceived latency (time to first token) from total latency.' },
        { id: 'r3', weight: 15, criterion: 'Attacks the reranker: fewer candidates than 50, a smaller or GPU model, or batching.' },
        { id: 'r4', weight: 15, criterion: 'Parallelises or overlaps independent work (history and embedding, moderation on the stream instead of after generation).' },
        { id: 'r5', weight: 10, criterion: 'Cuts model time: shorter prompt, lower max_tokens or concise output, prompt caching, or a faster model for simple turns.' },
        { id: 'r6', weight: 15, criterion: 'Measurement discipline: per-span tracing, p50/p95/p99, load testing, and a latency budget or alert.' },
        { id: 'r7', weight: 10, criterion: 'Discusses trade-offs (quality vs fewer candidates, moderation safety vs speed, cost).' },
      ],
      assets: [
        {
          title: 'Trace of one slow request (p50 = 5.2 s, p95 = 9.8 s)', kind: 'log',
          content: `span                 start      duration
auth_and_session         0 ms       40 ms
load_chat_history       40 ms      120 ms
embed_query            160 ms      180 ms
vector_search          340 ms      650 ms
rerank_top_50          990 ms    1,900 ms   cross-encoder on CPU, 50 candidates
build_prompt         2,890 ms       15 ms
llm_first_token      2,905 ms    2,300 ms   prompt is about 6,500 tokens
llm_generate         5,205 ms    4,100 ms   about 520 output tokens, stream=false
output_moderation    9,305 ms      700 ms   runs after the full answer exists
save_to_db          10,005 ms       90 ms
total                           10,095 ms`,
        },
        {
          title: 'Service configuration', kind: 'json',
          content: `{
  "pipeline": "sequential",
  "stream": false,
  "max_tokens": 2048,
  "rerank_candidates": 50,
  "top_k_after_rerank": 8,
  "output_moderation": "after_generation",
  "model": "large"
}`,
        },
      ],
    },
  },
  {
    slug: 'foundation-models-ai-engineering', title: 'What are foundation models, and how have they changed AI engineering?', topic: 'generative-ai-and-llms',
    subcategory: 'Fundamentals', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Think about what changed between training one model per task and adapting one model to many tasks.', 'What new system components and evaluation problems appear once the model is a shared, pre-trained asset?'],
    related: ['what-is-an-llm', 'chatgpt-request-lifecycle'],
  },
  {
    slug: 'what-is-an-llm', title: 'What is a Large Language Model (LLM), and how does it work?', topic: 'generative-ai-and-llms',
    subcategory: 'Fundamentals', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What exactly is the model trained to predict, and what loss is used?', 'How does a single next-token prediction turn into a whole paragraph?'],
    related: ['foundation-models-ai-engineering', 'transformer-architecture-overview'],
  },
  {
    slug: 'chatgpt-request-lifecycle', title: 'Inside ChatGPT: what happens after you hit Enter?', topic: 'generative-ai-and-llms',
    subcategory: 'LLM serving', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Separate what the application does from what the GPU serving layer does.', 'Why does text appear word by word, and what is slow before the first word?'],
    related: ['what-is-an-llm', 'decoder-only-forward-pass'],
  },
  {
    slug: 'transformer-architecture-overview', title: 'What is the Transformer architecture, and how does it work?', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What does self-attention let a model do that an RNN cannot?', 'How do encoder-only, decoder-only and encoder-decoder models differ?'],
    related: ['transformer-key-components', 'self-attention-in-transformers'],
  },
  {
    slug: 'transformer-key-components', title: 'What are the key components of the Transformer architecture?', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['For each part, ask what would break if you removed it.', 'Where do most of the parameters in a layer live?'],
    related: ['transformer-architecture-overview', 'decoder-only-forward-pass'],
  },
  {
    slug: 'decoder-only-forward-pass', title: 'Walk through one forward pass of a decoder-only Transformer', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'HARD', type: 'CONCEPTUAL', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Track the tensor shape after every operation.', 'What changes between a training pass, prefill, and a single decode step?'],
    related: ['transformer-key-components', 'self-attention-in-transformers'],
  },
  {
    slug: 'tokenization-in-llms', title: 'What is tokenization in LLMs?', topic: 'generative-ai-and-llms',
    subcategory: 'Tokenization', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What goes wrong with whole-word vocabularies and with pure character vocabularies?', 'Why do spelling and arithmetic tasks trip up LLMs?'],
    related: ['byte-pair-encoding', 'wordpiece-and-sentencepiece'],
  },
  {
    slug: 'byte-pair-encoding', title: 'Explain BPE (Byte Pair Encoding)', topic: 'generative-ai-and-llms',
    subcategory: 'Tokenization', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Work through two or three merges on a tiny corpus by hand.', 'How does encoding new text use the learned merges, and what changes at byte level?'],
    related: ['tokenization-in-llms', 'wordpiece-and-sentencepiece'],
  },
  {
    slug: 'wordpiece-and-sentencepiece', title: 'Explain WordPiece and SentencePiece', topic: 'generative-ai-and-llms',
    subcategory: 'Tokenization', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['How does WordPiece choose which pair to merge compared with BPE?', 'Is SentencePiece an algorithm or a toolkit?'],
    related: ['byte-pair-encoding', 'tokenization-in-llms'],
  },
  {
    slug: 'positional-encoding', title: 'What is positional encoding, and why is it needed in Transformers?', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What happens to attention outputs if you shuffle the input tokens?', 'Compare absolute, relative and rotary approaches.'],
    related: ['self-attention-in-transformers', 'transformer-key-components'],
  },
  {
    slug: 'embeddings-explained', title: 'What are embeddings?', topic: 'generative-ai-and-llms',
    subcategory: 'Embeddings', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Why is a one-hot vector a poor representation of a word?', 'How is the embedding table learned in an LLM?'],
    related: ['tokenization-in-llms', 'transformer-key-components'],
  },
  {
    slug: 'query-key-value-attention', title: 'Explain the Query (Q), Key (K) and Value (V) in attention', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Use the analogy of a soft dictionary lookup.', 'Why not use the same vector for matching and for content?'],
    related: ['self-attention-in-transformers', 'attention-scaling-sqrt-dk'],
  },
  {
    slug: 'self-attention-in-transformers', title: 'What is self-attention, and how does it work in Transformers?', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['List the steps from input matrix to output matrix.', 'What is the time and memory cost in sequence length?'],
    related: ['query-key-value-attention', 'cross-attention-in-transformers'],
  },
  {
    slug: 'cross-attention-in-transformers', title: 'What is cross-attention in Transformers?', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Which sequence provides the queries and which provides the keys and values?', 'Name models outside translation that rely on it.'],
    related: ['self-attention-in-transformers', 'query-key-value-attention'],
  },
  {
    slug: 'attention-scaling-sqrt-dk', title: 'Why do we scale dot-product attention by the square root of d_k?', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What is the variance of a dot product of two random d_k-dimensional vectors?', 'What happens to the softmax gradient when one input dominates?'],
    related: ['query-key-value-attention', 'vanishing-gradients'],
  },
  {
    slug: 'causal-masking', title: 'What is causal masking?', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What would a decoder learn if it could see the next token during training?', 'Why must masked scores be negative infinity rather than zero?'],
    related: ['self-attention-in-transformers', 'decoder-only-forward-pass'],
  },
  {
    slug: 'multi-head-attention', title: 'What are multi-head attention mechanisms? Why use multiple attention heads?', topic: 'generative-ai-and-llms',
    subcategory: 'Attention', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Compare the parameter and FLOP cost of one wide head with h narrower heads.', 'What do GQA and MQA change?'],
    related: ['self-attention-in-transformers', 'query-key-value-attention'],
  },
  {
    slug: 'feed-forward-networks-llms', title: 'What are Feed-Forward Networks in LLMs?', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What does attention not provide that the FFN does?', 'Where do most of a block\'s parameters live, and how does MoE use that?'],
    related: ['transformer-key-components', 'multi-head-attention'],
  },
  {
    slug: 'what-is-generative-ai', title: 'What is Generative AI?', topic: 'generative-ai-and-llms',
    subcategory: 'Fundamentals', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Contrast learning P(y|x) with learning P(x).', 'Which model family dominates text, and which dominates images?'],
    related: ['foundation-models-ai-engineering', 'what-is-an-llm'],
  },
  {
    slug: 'context-window-llms', title: 'What is the context window in LLMs, and why does it matter?', topic: 'generative-ai-and-llms',
    subcategory: 'Context and memory', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What counts toward the window besides the user message?', 'Does a bigger window guarantee the model uses it well?'],
    related: ['why-context-window-limited', 'chatgpt-request-lifecycle'],
  },
  {
    slug: 'why-context-window-limited', title: 'Why is the context window limited in LLMs?', topic: 'generative-ai-and-llms',
    subcategory: 'Context and memory', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Estimate KV-cache bytes per token for a concrete model.', 'What happens to positional encodings beyond the training length?'],
    related: ['context-window-llms', 'multi-head-attention'],
  },
  {
    slug: 'temperature-in-llms', title: 'What is temperature in the context of LLMs, and how does it affect output?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Write the softmax with temperature and compute it for logits [2, 1, 0].', 'Is temperature 0 truly deterministic in production?'],
    related: ['top-k-top-p-sampling', 'logits-in-text-generation'],
  },
  {
    slug: 'first-token-latency', title: 'Why is the first token slower than the rest in an LLM?', topic: 'generative-ai-and-llms',
    subcategory: 'LLM serving', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['What work happens once for the whole prompt versus once per generated token?', 'Which phase is compute-bound and which is memory-bandwidth-bound?'],
    related: ['chatgpt-request-lifecycle', 'why-context-window-limited'],
  },
  {
    slug: 'top-k-top-p-sampling', title: 'Explain Top-p (nucleus) sampling and Top-k sampling. How do they differ?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Which method adapts to how confident the model is?', 'What happens to each when the distribution is very peaked?'],
    related: ['temperature-in-llms', 'decoding-strategies-comparison'],
  },
  {
    slug: 'decoding-strategies-comparison', title: 'Compare greedy decoding, beam search, top-k, top-p, and temperature sampling. When does each fail?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'HARD', type: 'CONCEPTUAL', estimatedMinutes: 15,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Why is the highest-probability sequence often worse text for open-ended generation?', 'Which strategy would you pick for translation versus brainstorming?'],
    related: ['top-k-top-p-sampling', 'temperature-in-llms'],
  },
  {
    slug: 'logits-in-text-generation', title: 'What are logits, and how are they used in text generation?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Where in the network do logits come from, and what is their shape?', 'Why do implementations subtract the maximum before softmax?'],
    related: ['temperature-in-llms', 'decoder-only-forward-pass'],
  },
  {
    slug: 'stop-tokens-llms', title: 'What are stop tokens in LLMs, and how does an LLM know when to stop generating?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['How does the model learn to emit an end token?', 'What backstop prevents endless generation?'],
    related: ['stop-token-vs-stop-sequence', 'chatgpt-request-lifecycle'],
  },
  {
    slug: 'stop-token-vs-stop-sequence', title: 'What is the difference between a stop token and a stop sequence?', topic: 'generative-ai-and-llms',
    subcategory: 'Decoding', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Which one is checked on token IDs and which on decoded text?', 'Why must streaming hold back some characters?'],
    related: ['stop-tokens-llms', 'logits-in-text-generation'],
  },
  {
    slug: 'residual-connections-transformers', title: 'What are skip connections (residual connections) in Transformers?', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Differentiate y = x + F(x) with respect to x.', 'Why do modern LLMs prefer pre-norm?'],
    related: ['transformer-key-components', 'vanishing-gradients'],
  },
  {
    slug: 'open-vs-closed-source-llms', title: 'What is the difference between open-source and closed-source LLMs? When would you choose one over the other?', topic: 'generative-ai-and-llms',
    subcategory: 'Model selection', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Is open-weight the same as open-source?', 'At what volume does self-hosting start to pay off, and what hidden costs apply?'],
    related: ['foundation-models-ai-engineering', 'what-is-an-llm'],
  },
  // ===== Python for AI/ML (56 questions) =====
  {
    slug: 'python-gil-and-ml-workloads', title: 'What is the GIL, and how does it affect ML and data workloads?', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which kinds of work release the GIL while they wait or compute?', 'Why does PyTorch DataLoader use worker processes instead of threads?'],
    related: ['threading-multiprocessing-asyncio', 'asyncio-for-llm-api-calls'],
  },
  {
    slug: 'threading-multiprocessing-asyncio', title: 'Threading vs multiprocessing vs asyncio: which one for which ML task?', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Is the task waiting on the network or burning CPU?', 'What does it cost to move data between processes?'],
    related: ['python-gil-and-ml-workloads', 'asyncio-for-llm-api-calls'],
  },
  {
    slug: 'generators-vs-lists-large-datasets', title: 'Generators and lazy evaluation: why they matter for large datasets', topic: 'python-for-ai-ml',
    subcategory: 'Iteration', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What is stored in memory after calling a generator function: the values or the instructions to produce them?', 'What happens if you iterate over the same generator twice?'],
    related: ['iterators-vs-iterables', 'generator-exhausted-bug'],
  },
  {
    slug: 'python-decorators-explained', title: 'Explain Python decorators with examples from ML code', topic: 'python-for-ai-ml',
    subcategory: 'Functions', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['A decorator is just a function that takes a function and returns a function.', 'What do you lose if you forget functools.wraps?'],
    related: ['context-managers-with-statement', 'retry-decorator-exponential-backoff'],
  },
  {
    slug: 'context-managers-with-statement', title: 'What are context managers and the with statement used for?', topic: 'python-for-ai-ml',
    subcategory: 'Language features', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What two methods define the protocol?', 'What does returning True from __exit__ do?'],
    related: ['python-decorators-explained', 'pytorch-tensors-numpy-autograd'],
  },
  {
    slug: 'numpy-broadcasting-rules', title: 'Explain NumPy broadcasting and its rules', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Compare shapes starting from the trailing (rightmost) dimension.', 'When can a dimension of size 1 be stretched?'],
    related: ['numpy-views-vs-copies', 'vectorization-vs-python-loops'],
  },
  {
    slug: 'numpy-views-vs-copies', title: 'NumPy views vs copies: when does modifying one change another?', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which indexing styles return a view of the same memory?', 'How can you check whether two arrays share memory?'],
    related: ['numpy-broadcasting-rules', 'numpy-view-mutation-bug', 'shallow-vs-deep-copy'],
  },
  {
    slug: 'vectorization-vs-python-loops', title: 'Why is vectorised NumPy code so much faster than Python loops?', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['Count what the interpreter has to do per element in a Python loop.', 'Is np.vectorize actually vectorised?'],
    related: ['numpy-broadcasting-rules', 'stable-softmax-numpy', 'cosine-similarity-top-k'],
  },
  {
    slug: 'shallow-vs-deep-copy', title: 'Shallow copy vs deep copy in Python', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What does a shallow copy duplicate: the container or the objects inside?', 'Why can deepcopy be slow or fail on a model?'],
    related: ['numpy-views-vs-copies', 'list-multiplication-aliasing-bug'],
  },
  {
    slug: 'python-memory-management-and-gc', title: 'How does Python manage memory? Why can memory stay high after you delete objects?', topic: 'python-for-ai-ml',
    subcategory: 'Memory', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['What are the two mechanisms CPython uses to free objects?', 'Does del free memory, or only remove a name?'],
    related: ['training-loop-memory-growth-bug', 'fastapi-model-service-oom'],
  },
  {
    slug: 'builtin-data-structures-complexity', title: 'list vs tuple vs set vs dict: choosing by complexity and semantics', topic: 'python-for-ai-ml',
    subcategory: 'Data structures', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What is the time complexity of x in a list versus x in a set?', 'What must be true of an object for it to be a dict key?'],
    related: ['is-vs-equals-and-hashability'],
  },
  {
    slug: 'args-kwargs-and-argument-passing', title: 'Explain *args, **kwargs, keyword-only arguments and argument unpacking', topic: 'python-for-ai-ml',
    subcategory: 'Functions', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What types are args and kwargs inside the function?', 'How do you force callers to name an argument?'],
    related: ['python-decorators-explained', 'mutable-default-argument'],
  },
  {
    slug: 'iterators-vs-iterables', title: 'Iterables vs iterators: how does a for loop work, and how does PyTorch use this?', topic: 'python-for-ai-ml',
    subcategory: 'Iteration', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['What two methods make an object an iterator?', 'Why can you loop over a list twice but not over a file object or generator?'],
    related: ['generators-vs-lists-large-datasets', 'dunder-methods-for-ml-classes'],
  },
  {
    slug: 'lambda-comprehensions-map-filter', title: 'Lambda, map/filter and comprehensions: which should you use?', topic: 'python-for-ai-ml',
    subcategory: 'Functions', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 7,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['In Python 3, does map return a list?', 'Where is a lambda genuinely the cleanest choice?'],
    related: ['late-binding-closure-bug', 'generators-vs-lists-large-datasets'],
  },
  {
    slug: 'type-hints-and-pydantic-validation', title: 'Type hints vs runtime validation: where does Pydantic fit?', topic: 'python-for-ai-ml',
    subcategory: 'Typing and data validation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Does Python enforce type hints when the program runs?', 'Where does untrusted data enter an LLM application?'],
    related: ['dataclasses-vs-pydantic-vs-typeddict', 'validate-llm-json-output-pydantic'],
  },
  {
    slug: 'dataclasses-vs-pydantic-vs-typeddict', title: 'dataclass vs NamedTuple vs TypedDict vs Pydantic: how do you choose?', topic: 'python-for-ai-ml',
    subcategory: 'Typing and data validation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which of these validate input at runtime?', 'Which one is just a plain dict at runtime?'],
    related: ['type-hints-and-pydantic-validation', 'mutable-default-argument'],
  },
  {
    slug: 'is-vs-equals-and-hashability', title: 'is vs ==, and what makes an object hashable?', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['Does == compare identity or value?', 'What goes wrong if you define __eq__ but not __hash__?'],
    related: ['builtin-data-structures-complexity', 'float-and-nan-comparison-bug'],
  },
  {
    slug: 'pandas-loc-iloc-and-copy-semantics', title: 'pandas loc vs iloc, and the SettingWithCopy problem', topic: 'python-for-ai-ml',
    subcategory: 'pandas', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Is the end of a loc slice inclusive or exclusive?', 'When you chain two indexing operations, is the second one writing into the original frame or into a temporary?'],
    related: ['pandas-chained-assignment-bug', 'numpy-views-vs-copies'],
  },
  {
    slug: 'asyncio-for-llm-api-calls', title: 'How does asyncio work, and why is it a good fit for LLM API calls?', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['What does await let the event loop do while it waits?', 'What happens to every other task if one coroutine runs a blocking call?'],
    related: ['async-parallel-llm-calls-semaphore', 'blocking-call-in-async-bug', 'threading-multiprocessing-asyncio'],
  },
  {
    slug: 'closures-scope-and-nonlocal', title: 'Variable scope (LEGB), closures and nonlocal', topic: 'python-for-ai-ml',
    subcategory: 'Functions', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 9,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['In what order does Python look up a name?', 'What happens when you assign to a name inside a function without declaring it nonlocal or global?'],
    related: ['late-binding-closure-bug', 'python-decorators-explained'],
  },
  {
    slug: 'pickle-joblib-safetensors', title: 'pickle vs joblib vs safetensors: how should you save and load models safely?', topic: 'python-for-ai-ml',
    subcategory: 'Serialization', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['What can an object do while it is being unpickled?', 'Why is saving only the state_dict preferred to saving a whole model object?'],
    related: ['pytorch-tensors-numpy-autograd', 'custom-sklearn-transformer'],
  },
  {
    slug: 'custom-sklearn-transformer', title: 'How do you write a custom scikit-learn transformer that works in a Pipeline?', topic: 'python-for-ai-ml',
    subcategory: 'scikit-learn and OOP', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Why must __init__ only store its parameters?', 'Where should learned values go, and how are they named?'],
    related: ['sklearn-pipeline-without-leakage', 'data-leakage-scaler-bug', 'dunder-methods-for-ml-classes'],
  },
  {
    slug: 'dunder-methods-for-ml-classes', title: 'Special (dunder) methods: how do __getitem__, __len__ and __call__ power PyTorch?', topic: 'python-for-ai-ml',
    subcategory: 'Python data model', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which dunder does len(obj) call?', 'Why should you call model(x) rather than model.forward(x)?'],
    related: ['iterators-vs-iterables', 'custom-pytorch-dataset-dataloader'],
  },
  {
    slug: 'pytorch-tensors-numpy-autograd', title: 'Tensors vs NumPy arrays: autograd, detach(), no_grad and memory sharing', topic: 'python-for-ai-ml',
    subcategory: 'PyTorch for Python devs', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Why does PyTorch refuse to convert a tensor that requires grad to NumPy directly?', 'What does torch.from_numpy share with the original array?'],
    related: ['numpy-views-vs-copies', 'training-loop-memory-growth-bug'],
  },
  {
    slug: 'batch-iterator-for-api-calls', title: 'Write a batching helper for sending texts to an embedding API', topic: 'python-for-ai-ml',
    subcategory: 'Iteration', difficulty: 'EASY', type: 'PRACTICAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which itertools function helps take n items at a time?', 'Should the function materialise the whole input as a list?'],
    related: ['generators-vs-lists-large-datasets', 'async-parallel-llm-calls-semaphore'],
  },
  {
    slug: 'retry-decorator-exponential-backoff', title: 'Implement a retry decorator with exponential backoff and jitter', topic: 'python-for-ai-ml',
    subcategory: 'Reliability', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which errors are worth retrying and which are not?', 'Why add random jitter?'],
    related: ['python-decorators-explained', 'token-bucket-rate-limiter'],
  },
  {
    slug: 'async-parallel-llm-calls-semaphore', title: 'Process 1,000 prompts concurrently with a concurrency limit', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['What limits how many requests you can have in flight?', 'What should happen to the other prompts if one call fails?'],
    related: ['asyncio-for-llm-api-calls', 'blocking-call-in-async-bug', 'token-bucket-rate-limiter'],
  },
  {
    slug: 'stable-softmax-numpy', title: 'Implement a numerically stable softmax in NumPy', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'EASY', type: 'PRACTICAL', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What happens to np.exp(1000)?', 'Does subtracting a constant from every logit change the softmax output?'],
    related: ['vectorization-vs-python-loops', 'numpy-broadcasting-rules'],
  },
  {
    slug: 'cosine-similarity-top-k', title: 'Find the top-k most similar documents with cosine similarity in NumPy', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['How can cosine similarity be turned into one matrix-vector product?', 'Do you need to fully sort 1 million scores to get the top 5?'],
    related: ['vectorization-vs-python-loops', 'numpy-broadcasting-rules', 'embeddings-explained'],
  },
  {
    slug: 'kmeans-from-scratch-numpy', title: 'Implement k-means clustering from scratch with NumPy', topic: 'python-for-ai-ml',
    subcategory: 'NumPy and algorithms', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 20,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Can you compute all point-to-centroid distances without a Python loop?', 'What should happen if a cluster ends up with no points?'],
    related: ['vectorization-vs-python-loops', 'numpy-broadcasting-rules'],
  },
  {
    slug: 'pandas-groupby-top-n-rolling-features', title: 'pandas: top-N per group and leakage-safe rolling features', topic: 'python-for-ai-ml',
    subcategory: 'pandas', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Should a feature for a transaction include that same transaction in its window?', 'Does the data need to be sorted before a rolling window?'],
    related: ['pandas-loc-iloc-and-copy-semantics', 'sklearn-pipeline-without-leakage'],
  },
  {
    slug: 'stream-large-csv-in-chunks', title: 'Process a 20 GB CSV on a laptop with 16 GB of RAM', topic: 'python-for-ai-ml',
    subcategory: 'Data loading', difficulty: 'EASY', type: 'PRACTICAL', estimatedMinutes: 10,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['Do you need all columns? Do you need default dtypes?', 'How do you combine partial results from several chunks?'],
    related: ['generators-vs-lists-large-datasets', 'slow-pandas-preprocessing-job'],
  },
  {
    slug: 'memoize-embeddings-with-cache', title: 'Cache embeddings so repeated texts are never recomputed', topic: 'python-for-ai-ml',
    subcategory: 'Performance', difficulty: 'EASY', type: 'PRACTICAL', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What does lru_cache require of its arguments?', 'How would you avoid paying for the same text twice across program restarts?'],
    related: ['python-decorators-explained', 'batch-iterator-for-api-calls'],
  },
  {
    slug: 'text-chunker-with-overlap', title: 'Write a text chunker with overlap for a RAG pipeline', topic: 'python-for-ai-ml',
    subcategory: 'RAG preprocessing', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['What happens near the end of the document, where the last window may be short?', 'Is a word count the same as a token count?'],
    related: ['batch-iterator-for-api-calls', 'irrelevant-retrieval-rag'],
  },
  {
    slug: 'validate-llm-json-output-pydantic', title: 'Parse and validate structured JSON from an LLM, with a repair loop', topic: 'python-for-ai-ml',
    subcategory: 'LLM engineering', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Can you trust the model to return exactly the schema you asked for?', 'What information would help the model fix its own invalid output?'],
    related: ['type-hints-and-pydantic-validation', 'retry-decorator-exponential-backoff'],
  },
  {
    slug: 'sklearn-pipeline-without-leakage', title: 'Build a leakage-free scikit-learn pipeline with mixed feature types', topic: 'python-for-ai-ml',
    subcategory: 'scikit-learn', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Where must imputers, scalers and encoders be fitted?', 'What does cross_val_score do with a Pipeline on each fold?'],
    related: ['data-leakage-scaler-bug', 'custom-sklearn-transformer'],
  },
  {
    slug: 'custom-pytorch-dataset-dataloader', title: 'Write a PyTorch Dataset and a padding collate function for variable-length text', topic: 'python-for-ai-ml',
    subcategory: 'PyTorch for Python devs', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 18,
    roles: [ROLES.ml, ROLES.genai],
    hints: ['Why can a default collate function not stack sequences of different lengths?', 'How do you build the attention mask without confusing real tokens with padding?'],
    related: ['dunder-methods-for-ml-classes', 'pytorch-tensors-numpy-autograd'],
  },
  {
    slug: 'token-bucket-rate-limiter', title: 'Implement a thread-safe token-bucket rate limiter for an LLM client', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'HARD', type: 'PRACTICAL', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['What two things does the bucket track, and when are tokens added?', 'Which clock should you use for measuring elapsed time?'],
    related: ['async-parallel-llm-calls-semaphore', 'retry-decorator-exponential-backoff'],
  },
  {
    slug: 'late-binding-closure-bug', title: 'Debug lambdas created in a loop that all return the same value', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 6,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['When is the variable i looked up: when the lambda is created or when it is called?'],
    related: ['closures-scope-and-nonlocal', 'lambda-comprehensions-map-filter'],
  },
  {
    slug: 'list-multiplication-aliasing-bug', title: 'Debug a 2D grid where changing one cell changes a whole column', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 6,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['How many distinct inner lists does [[0] * 3] * 3 create?'],
    related: ['shallow-vs-deep-copy', 'mutable-default-argument'],
  },
  {
    slug: 'generator-exhausted-bug', title: 'Debug a training loop where epochs 2 and 3 do nothing', topic: 'python-for-ai-ml',
    subcategory: 'Iteration', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What does a generator return when you iterate over it a second time?'],
    related: ['generators-vs-lists-large-datasets', 'iterators-vs-iterables'],
  },
  {
    slug: 'modify-collection-while-iterating-bug', title: 'Debug a cleaning loop that skips items and a dict loop that crashes', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 7,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['What happens to the indexes of later items when you remove an item from a list during a for loop?'],
    related: ['builtin-data-structures-complexity'],
  },
  {
    slug: 'pandas-chained-assignment-bug', title: 'Debug a pandas labelling step that has no effect', topic: 'python-for-ai-ml',
    subcategory: 'pandas', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['How many separate operations does df[mask]["label"] = 1 perform?', 'Is the object returned by df[mask] guaranteed to be a view of df?'],
    related: ['pandas-loc-iloc-and-copy-semantics'],
  },
  {
    slug: 'numpy-view-mutation-bug', title: 'Debug a normalisation function that corrupts the original dataset', topic: 'python-for-ai-ml',
    subcategory: 'NumPy', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Does basic slicing copy the data?', 'What does += do to an existing array?'],
    related: ['numpy-views-vs-copies', 'data-leakage-scaler-bug'],
  },
  {
    slug: 'data-leakage-scaler-bug', title: 'Debug a model whose test score is great offline and poor in production', topic: 'python-for-ai-ml',
    subcategory: 'scikit-learn', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 12,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['At what point does the test set influence the scaler?', 'How does this differ for time-ordered data?'],
    related: ['sklearn-pipeline-without-leakage', 'model-degradation-after-deployment'],
  },
  {
    slug: 'blocking-call-in-async-bug', title: 'Debug an async summariser that is no faster than the sequential version', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 12,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['Which line in the coroutine does not yield control back to the event loop?'],
    related: ['asyncio-for-llm-api-calls', 'async-parallel-llm-calls-semaphore'],
  },
  {
    slug: 'training-loop-memory-growth-bug', title: 'Debug a PyTorch loop whose memory grows every step and whose validation is wrong', topic: 'python-for-ai-ml',
    subcategory: 'PyTorch for Python devs', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 15,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What does a stored loss tensor keep alive besides its value?', 'Which calls switch layers like dropout to inference behaviour?'],
    related: ['pytorch-tensors-numpy-autograd', 'python-memory-management-and-gc'],
  },
  {
    slug: 'float-and-nan-comparison-bug', title: 'Debug equality checks that fail on floats and NaN', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 8,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['Can 0.1 be represented exactly in binary floating point?', 'What is the result of nan == nan?'],
    related: ['is-vs-equals-and-hashability'],
  },
  {
    slug: 'multiprocessing-cuda-pickle-bug', title: 'Debug a multiprocessing job that fails with pickling and CUDA errors', topic: 'python-for-ai-ml',
    subcategory: 'Concurrency', difficulty: 'HARD', type: 'DEBUGGING', estimatedMinutes: 18,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai],
    hints: ['How does a worker process receive the function and its arguments?', 'What start method creates a worker that inherits an already-initialised CUDA context?'],
    related: ['threading-multiprocessing-asyncio', 'python-gil-and-ml-workloads'],
  },
  {
    slug: 'design-llm-client-wrapper', title: 'Design a reusable Python client library for calling multiple LLM providers', topic: 'python-for-ai-ml',
    subcategory: 'Python architecture', difficulty: 'HARD', type: 'SYSTEM_DESIGN', estimatedMinutes: 25,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Start with who the callers are and what they should never have to know about the provider.', 'List the cross-cutting concerns that every call needs.'],
    related: ['retry-decorator-exponential-backoff', 'token-bucket-rate-limiter', 'validate-llm-json-output-pydantic'],
  },
  {
    slug: 'design-batch-embedding-pipeline', title: 'Design a Python pipeline to embed 50 million documents and keep them updated', topic: 'python-for-ai-ml',
    subcategory: 'Data pipelines', difficulty: 'HARD', type: 'SYSTEM_DESIGN', estimatedMinutes: 30,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Estimate throughput first: documents, tokens, and what the API or GPU can do per second.', 'What makes the job safe to restart halfway?'],
    related: ['batch-iterator-for-api-calls', 'memoize-embeddings-with-cache', 'design-document-qa-system'],
  },
  {
    slug: 'design-ml-python-project-structure', title: 'Design the structure of a maintainable Python ML codebase', topic: 'python-for-ai-ml',
    subcategory: 'Python architecture', difficulty: 'MEDIUM', type: 'SYSTEM_DESIGN', estimatedMinutes: 20,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What should never differ between training and serving?', 'How would a new teammate reproduce last month\'s result?'],
    related: ['sklearn-pipeline-without-leakage', 'pickle-joblib-safetensors', 'notebook-to-production-refactor'],
  },
  {
    slug: 'design-agent-tool-registry-python', title: 'Design a Python tool registry for an LLM agent', topic: 'python-for-ai-ml',
    subcategory: 'Python architecture', difficulty: 'MEDIUM', type: 'SYSTEM_DESIGN', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Where should the JSON schema for a tool come from so it cannot drift from the code?', 'What must be checked between the model choosing a tool and the tool running?'],
    related: ['python-decorators-explained', 'type-hints-and-pydantic-validation', 'agent-calls-wrong-tool'],
  },
  {
    slug: 'slow-pandas-preprocessing-job', title: 'A nightly pandas preprocessing job now takes 6 hours', topic: 'python-for-ai-ml',
    subcategory: 'Performance', difficulty: 'MEDIUM', type: 'CASE_STUDY', estimatedMinutes: 25,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Add up the profile percentages before deciding what to fix first.', 'Which of these operations run Python code once per row?'],
    related: ['stream-large-csv-in-chunks', 'vectorization-vs-python-loops'],
    challenge: {
      steps: [
        { title: 'Read the evidence', prompt: 'What do the profile and code tell you? Quantify where time and memory go.' },
        { title: 'Prioritise fixes', prompt: 'Rank the changes by expected gain and effort, with a rough estimate for each.' },
        { title: 'Protect correctness', prompt: 'How will you prove the faster job produces the same features?' },
        { title: 'Roll out and monitor', prompt: 'How do you ship this safely and stop it regressing?' },
      ],
      rubric: [
        { id: 'r1', weight: 15, criterion: 'Reads the profile: about 78% in row-wise apply, about 12% in iterrows/loc assignment, plus 22 GB memory from object-dtype strings and unneeded columns.' },
        { id: 'r2', weight: 20, criterion: 'Replaces row-wise apply and iterrows with vectorised column operations (str accessors, np.where/np.select, merge/map) and explains why this is faster.' },
        { id: 'r3', weight: 15, criterion: 'Reduces memory with column selection, compact dtypes/categoricals and Parquet instead of CSV; merges on integer or categorical keys.' },
        { id: 'r4', weight: 10, criterion: 'Replaces groupby.apply(lambda) with built-in agg/transform, or suggests Polars/DuckDB/Dask when appropriate.' },
        { id: 'r5', weight: 20, criterion: 'Protects correctness: golden sample, output diff with tolerances, running old and new in parallel, data quality checks.' },
        { id: 'r6', weight: 10, criterion: 'Quantifies expected speedups with stated assumptions and re-profiles after each change.' },
        { id: 'r7', weight: 10, criterion: 'Discusses rollout, monitoring (runtime/memory alerts) and trade-offs of switching tools.' },
      ],
      assets: [
        { title: 'Profile of the nightly job (30M rows, total 21,640 s)', kind: 'log', content: `function                                   cumulative_s    share
DataFrame.apply(axis=1) -> clean_row         10,900       50%
DataFrame.apply(axis=1) -> make_key           5,950       27%
loop: iterrows + df.loc[i, "flag"] = ...      2,600       12%
groupby("user_id").apply(user_features)       1,100        5%
DataFrame.merge(lookup, on="sku_text")          700        3%
read_csv + parse                                390        2%

peak memory: 22 GB   (machine: 32 GB, other jobs also run on it)
read_csv columns: 41 loaded, 9 used downstream` },
        { title: 'Code excerpt', kind: 'python', content: `df = pd.read_csv("events.csv")                        # all columns, default dtypes

def clean_row(r):
    name = r["product_name"].lower().strip()
    price = r["price"] if r["price"] > 0 else None
    return pd.Series({"name": name, "price_clean": price})

df[["name", "price_clean"]] = df.apply(clean_row, axis=1)
df["key"] = df.apply(lambda r: f"{r['user_id']}_{r['sku_text']}", axis=1)

for i, row in df.iterrows():
    if row["price_clean"] is not None and row["price_clean"] > 500:
        df.loc[i, "flag"] = 1

feats = df.groupby("user_id").apply(lambda g: user_features(g))
df = df.merge(lookup, on="sku_text", how="left")` },
      ],
    },
  },
  {
    slug: 'fastapi-model-service-oom', title: 'A FastAPI model-serving container keeps getting OOM-killed', topic: 'python-for-ai-ml',
    subcategory: 'Serving and memory', difficulty: 'HARD', type: 'CASE_STUDY', estimatedMinutes: 25,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['How many copies of the model are in memory, and how big is each one?', 'Which memory growth is a one-time cost and which grows with traffic?'],
    related: ['python-memory-management-and-gc', 'python-gil-and-ml-workloads', 'multiprocessing-cuda-pickle-bug'],
    challenge: {
      steps: [
        { title: 'Diagnose', prompt: 'What explains the OOM kills and the latency spikes? Use numbers from the evidence.' },
        { title: 'Immediate mitigation', prompt: 'What do you change today to stop the restarts?' },
        { title: 'Root-cause fix', prompt: 'What code and architecture changes fix the underlying problems?' },
        { title: 'Verify and prevent', prompt: 'How do you prove it is fixed and catch it earlier next time?' },
      ],
      rubric: [
        { id: 'r1', weight: 20, criterion: 'Notices that 8 workers x about 1.9 GB model is about 15 GB of the 16 GB limit, so memory is multiplied by worker count.' },
        { id: 'r2', weight: 20, criterion: 'Identifies the unbounded per-worker result cache as a steady leak and proposes a bounded TTL cache or shared Redis cache.' },
        { id: 'r3', weight: 10, criterion: 'Spots the blocking synchronous inference inside async endpoints and the missing no_grad/inference_mode on one path.' },
        { id: 'r4', weight: 15, criterion: 'Gives a safe short-term mitigation: fewer workers, max_requests recycling, input size limits, correct limits and alerts.' },
        { id: 'r5', weight: 15, criterion: 'Proposes structural fixes: load once, preload/mmap or quantise the model, micro-batching, or a dedicated model server separate from the API.' },
        { id: 'r6', weight: 10, criterion: 'Verifies with load/soak tests and memory profiling (tracemalloc/memray, RSS over time), with monitoring and alerts.' },
        { id: 'r7', weight: 10, criterion: 'Discusses trade-offs such as copy-on-write limits, cache staleness and privacy, and added operational complexity.' },
      ],
      assets: [
        { title: 'Container and server configuration', kind: 'json', content: `{
  "container_memory_limit": "16Gi",
  "gunicorn": { "workers": 8, "worker_class": "uvicorn.workers.UvicornWorker", "preload": false, "max_requests": 0 },
  "model": { "file": "classifier.pt", "size_on_disk_gb": 1.9, "loaded_per_worker": true, "dtype": "float32" },
  "cache": { "type": "in-process dict", "key": "full input text", "max_size": null, "ttl": null },
  "endpoint": "async def predict(...) calls model(...) synchronously"
}` },
        { title: 'Memory and latency observations (one pod, 2 days)', kind: 'log', content: `time          pod_RSS   per_worker_RSS (avg)   p95_latency   requests/min
Sat 00:00      9.1 GB     1.1 GB (after warm-up)      180 ms         240
Sat 12:00     12.7 GB     1.6 GB                      260 ms         610
Sat 21:30     15.4 GB     1.9 GB                    1,900 ms         700
Sat 22:05     OOMKilled -> restart
Sun 10:00     14.2 GB     1.8 GB                      900 ms         590
Sun 15:40     OOMKilled -> restart

at startup (no traffic): 8 workers x about 1.1 GB; weights alone are 1.9 GB on disk
largest request body seen: 4.8 MB of text; tokenizer max_length not set on /predict_long` },
      ],
    },
  },
  {
    slug: 'notebook-to-production-refactor', title: 'Turn a data scientist\'s notebook into a production-ready service', topic: 'python-for-ai-ml',
    subcategory: 'Engineering practice', difficulty: 'MEDIUM', type: 'CASE_STUDY', estimatedMinutes: 25,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Which cells would behave differently in production than on the author\'s laptop?', 'What has to be identical between the training code and the code that serves predictions?'],
    related: ['design-ml-python-project-structure', 'data-leakage-scaler-bug', 'pickle-joblib-safetensors'],
    challenge: {
      steps: [
        { title: 'Review the notebook', prompt: 'List the problems that would hurt in production, ranked by risk.' },
        { title: 'Refactor plan', prompt: 'What is the target structure and the order of work?' },
        { title: 'Testing and deployment', prompt: 'How will you test it and ship batch plus API?' },
        { title: 'Monitor and manage risk', prompt: 'What do you monitor after launch and what could go wrong?' },
      ],
      rubric: [
        { id: 'r1', weight: 20, criterion: 'Identifies leakage (statistics and scaling before the split, random split on time-ordered data) and plans to re-establish an honest baseline before shipping.' },
        { id: 'r2', weight: 15, criterion: 'Identifies training/serving skew risk and proposes a single Pipeline/ColumnTransformer artifact (including handling unseen categories).' },
        { id: 'r3', weight: 10, criterion: 'Addresses reproducibility: pinned dependencies, seeds, config and secrets management, removal of hard-coded paths and global state.' },
        { id: 'r4', weight: 15, criterion: 'Proposes a concrete test strategy: unit tests for transforms, data validation, smoke training, regression/parity tests between batch and API.' },
        { id: 'r5', weight: 15, criterion: 'Designs deployment sensibly: batch job and FastAPI service, model loaded once, versioned artifact with metadata, CI-built container, rollback.' },
        { id: 'r6', weight: 15, criterion: 'Defines monitoring: data and prediction drift, latency/errors, delayed-label performance, alerts, shadow period and retraining triggers.' },
        { id: 'r7', weight: 10, criterion: 'Orders the work realistically for three weeks, states risks (metric drop, feature availability) and trade-offs.' },
      ],
      assets: [
        { title: 'Notebook summary (cells in execution order)', kind: 'log', content: `[1] df = pd.read_csv("C:/Users/anita/Desktop/churn_final_v3.csv"); api_key = "sk-..."   # path and a key in plain text
[2] df = df.fillna(df.mean(numeric_only=True))                    # mean over ALL rows
[3] df = pd.get_dummies(df, columns=["plan", "city"])             # on the whole frame
[4] X = StandardScaler().fit_transform(df.drop("churned", axis=1))  # scaler not saved
[5] X_train, X_test, y_train, y_test = train_test_split(X, df.churned, test_size=0.2)   # random split
[6] model = GradientBoostingClassifier().fit(X_train, y_train)    # no random_state
[7] print(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))   # 0.93
[8] pickle.dump(model, open("model.pkl", "wb"))                   # model only

data: 18 months of daily customer snapshots; many rows per customer
requirements.txt: not present   |   tests: none` },
        { title: 'Requirements from the business', kind: 'json', content: `{
  "deliverables": ["daily batch scores for all active customers", "REST endpoint for single-customer scoring"],
  "deadline_weeks": 3,
  "latency_target_ms_p95": 300,
  "batch_size": "about 2 million customers per day",
  "constraint": "retention team only acts on the top 5% of risk scores",
  "notes": "marketing wants a go-live date this month; model owner is on leave in week 2"
}` },
      ],
    },
  },
];

module.exports = { topics, problems };