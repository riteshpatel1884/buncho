A DataFrame `df` has columns `user_id`, `ts` (datetime) and `amount`. Write code to produce:

1. the 3 largest transactions per user,
2. a feature `avg_7d`: each user's mean `amount` over the previous 7 days, **excluding the current row**,
3. a feature `days_since_prev`: days since that user's previous transaction.

Explain why (2) must exclude the current row.
