// Metadata for the starter question bank.
// Question text lives in content/<slug>.question.md and the reference solution in content/<slug>.solution.md.
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
];

module.exports = { topics, problems };
