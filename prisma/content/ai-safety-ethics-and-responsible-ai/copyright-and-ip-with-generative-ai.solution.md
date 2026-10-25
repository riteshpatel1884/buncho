*(Law is evolving and varies by country; consult counsel.)*

**Three separate questions**

1. **Training data:** is using copyrighted works to train lawful (fair use in the US is being litigated; text-and-data-mining exceptions with opt-outs in the EU/UK/Japan)? Risks: scraping against terms, ignoring robots.txt/opt-outs, pirated sources.
2. **Outputs:** can the model reproduce protected content (verbatim text, code under copyleft licenses, images in an artist's style or with logos/characters)? Output similarity can infringe regardless of training legality.
3. **Ownership:** most jurisdictions (e.g. US Copyright Office) require **human authorship**; purely AI-generated output may not be copyrightable, while human-directed, edited works can be protected to the extent of human contribution.

**Practical controls**

- **Data:** licensed or permissively licensed corpora, record provenance, honour opt-outs, filter known pirated sources, maintain datasheets; offer creator opt-out channels.
- **Model/product:** deduplicate training data (reduces memorisation), output filters for verbatim matches (n-gram/hash, code license scanners), block requests for named copyrighted characters/works, style-of-living-artist policies, retrieval with attribution and licensed sources.
- **Contract:** vendor IP indemnities (many providers offer them), terms of use that assign responsibilities, enterprise indemnification, license compatibility checks for generated code.
- **Disclosure and provenance:** watermarks, C2PA content credentials, labelling AI content.
- **Process:** takedown/notice workflow, human review for publishable content, record prompts/outputs, legal review for high-risk uses, insurance.
- **Users:** advise on checking outputs, avoid feeding confidential or third-party IP into prompts.
