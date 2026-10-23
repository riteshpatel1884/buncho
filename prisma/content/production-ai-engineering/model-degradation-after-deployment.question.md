A churn-prediction model was launched three months ago. Monitoring now shows:

| Metric | Launch week | Week 12 |
|---|---:|---:|
| AUC on labelled customers | 0.84 | 0.74 |
| Share of customers flagged high-risk | 8% | 3% |
| Null rate of `merchant_category` | 0.4% | 23% |
| Mean of `days_since_last_login` | 11 | 17 |

Ground-truth churn labels arrive about 45 days after the prediction. Two weeks ago the data team migrated the events pipeline to a new warehouse. Marketing also changed its pricing plans last month.

How do you diagnose this, and what do you do about it?
