# Data Schema

## Source: SSSMC API
Data is collected from `https://www.sssmediacentre.org/api/public/search/audio/`.

### Schema fields (`data/bhajans.json`)

| field | type | description |
|---|---|---|
| `id` | string | Unique record ID from SSSMC |
| `name` | string | Title of the bhajan |
| `slug` | string | Normalized slug for URL/grouping |
| `date` | string \| null | Sung date extracted from filename (`YYYY-MM-DD`) |
| `order` | number \| null | Sequence number sung that day |
| `session` | string \| null | Session indicator (Morning/Evening) |
| `deity` | string \| null | Associated deity classification |
| `raga` | string \| null | Musical raga |
| `beat` | string \| null | Tala / Beat specification |
| `speed` | string \| null | Tempo (Slow, Medium, Fast) |
| `sruthi_male` | string \| null | Male vocal pitch |
| `sruthi_female` | string \| null | Female vocal pitch |
| `lyrics` | string \| null | Full lyrics text |
| `meaning` | string \| null | English translation/meaning |
| `duration` | string \| null | Duration span (`HH:MM:SS`) |
| `source_id` | string | Original SSSMC `_id` |
| `sub_category` | string | Specific sub-category |