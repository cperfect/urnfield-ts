## 1.0.1 (2026-06-28)

### Features

* implement glob dialect and NSS schema validation ([4475db9](https://github.com/cperfect/urnfield-ts/commit/4475db975a55b1d3ba89f75db318a3c78d72e11b))
* implement URN equivalence (equals) ([2dd5b0f](https://github.com/cperfect/urnfield-ts/commit/2dd5b0f5dffd9a8a8157ffa4db062d459bab766b))
* implement URN parsing (parse, tryParse) ([3498e25](https://github.com/cperfect/urnfield-ts/commit/3498e25499b5226adff73235505254facdbc134e))
* implement well-formedness and canonical formatting ([616ef91](https://github.com/cperfect/urnfield-ts/commit/616ef916cdf9ee039ca243d63b3f041868c3300a))
* scaffold types, errors, and conformance test harness ([9be9380](https://github.com/cperfect/urnfield-ts/commit/9be938038fa0cde191e47c720b8140c3076a0a92))

### Bug Fixes

* correct repository url to urnfield-ts ([60dd6b0](https://github.com/cperfect/urnfield-ts/commit/60dd6b0eefd60b187983acb5d54427ccd25230ec))
* guard isWellFormed against null/non-object inputs ([e4a25c0](https://github.com/cperfect/urnfield-ts/commit/e4a25c0e240ab84450d94dd95ef1f7d631859d06))
* ignore braces inside character classes in findBraceEnd ([b550f00](https://github.com/cperfect/urnfield-ts/commit/b550f0033b74030f356d8d77b2be7d88eef25c87))
* keep validate non-throwing on malformed schema patterns ([fd9b843](https://github.com/cperfect/urnfield-ts/commit/fd9b843540b6354572b0cfb2109d3e61813db090))
* make splitTopComma class-aware for consistency with findBraceEnd ([921a3f0](https://github.com/cperfect/urnfield-ts/commit/921a3f06dedda648b3e4c99d4e7d96df0c585d72))
* parse parameter names safely against Object.prototype keys ([e046492](https://github.com/cperfect/urnfield-ts/commit/e04649261a23655143780da18853f3ba89060b3a))
* reject empty ?= / ?+ items and empty keys when parsing ([21d05ca](https://github.com/cperfect/urnfield-ts/commit/21d05ca6f9212f5b08c50a970c537885e085e5e2))
* reject non-encodable components in format() ([58fd4bb](https://github.com/cperfect/urnfield-ts/commit/58fd4bb233de9d18c9f21e788613bbf82a736ec9))
* resolve conformance fixtures relative to the loader, not cwd ([08c0332](https://github.com/cperfect/urnfield-ts/commit/08c0332fc772dbb54d4d5dba1446b15fedf886ba))
* return a fresh validate success result, not a shared object ([4fe8e87](https://github.com/cperfect/urnfield-ts/commit/4fe8e874bb654818db6fc442a22fa4f071152bf8))
* treat ^ as literal inside glob character classes ([5f695d7](https://github.com/cperfect/urnfield-ts/commit/5f695d7b7d0d31cb2c375a6175dafb6fb636c213))
* validate the full payload in format() before rendering ([5223759](https://github.com/cperfect/urnfield-ts/commit/52237591ccaed9344dfb26c803d79d16caed9ec5))
## 1.0.1 (2026-06-28)

### Features

* implement glob dialect and NSS schema validation ([4475db9](https://github.com/cperfect/urnfield-ts/commit/4475db975a55b1d3ba89f75db318a3c78d72e11b))
* implement URN equivalence (equals) ([2dd5b0f](https://github.com/cperfect/urnfield-ts/commit/2dd5b0f5dffd9a8a8157ffa4db062d459bab766b))
* implement URN parsing (parse, tryParse) ([3498e25](https://github.com/cperfect/urnfield-ts/commit/3498e25499b5226adff73235505254facdbc134e))
* implement well-formedness and canonical formatting ([616ef91](https://github.com/cperfect/urnfield-ts/commit/616ef916cdf9ee039ca243d63b3f041868c3300a))
* scaffold types, errors, and conformance test harness ([9be9380](https://github.com/cperfect/urnfield-ts/commit/9be938038fa0cde191e47c720b8140c3076a0a92))

### Bug Fixes

* correct repository url to urnfield-ts ([60dd6b0](https://github.com/cperfect/urnfield-ts/commit/60dd6b0eefd60b187983acb5d54427ccd25230ec))
* guard isWellFormed against null/non-object inputs ([e4a25c0](https://github.com/cperfect/urnfield-ts/commit/e4a25c0e240ab84450d94dd95ef1f7d631859d06))
* ignore braces inside character classes in findBraceEnd ([b550f00](https://github.com/cperfect/urnfield-ts/commit/b550f0033b74030f356d8d77b2be7d88eef25c87))
* keep validate non-throwing on malformed schema patterns ([fd9b843](https://github.com/cperfect/urnfield-ts/commit/fd9b843540b6354572b0cfb2109d3e61813db090))
* make splitTopComma class-aware for consistency with findBraceEnd ([921a3f0](https://github.com/cperfect/urnfield-ts/commit/921a3f06dedda648b3e4c99d4e7d96df0c585d72))
* parse parameter names safely against Object.prototype keys ([e046492](https://github.com/cperfect/urnfield-ts/commit/e04649261a23655143780da18853f3ba89060b3a))
* reject empty ?= / ?+ items and empty keys when parsing ([21d05ca](https://github.com/cperfect/urnfield-ts/commit/21d05ca6f9212f5b08c50a970c537885e085e5e2))
* reject non-encodable components in format() ([58fd4bb](https://github.com/cperfect/urnfield-ts/commit/58fd4bb233de9d18c9f21e788613bbf82a736ec9))
* resolve conformance fixtures relative to the loader, not cwd ([08c0332](https://github.com/cperfect/urnfield-ts/commit/08c0332fc772dbb54d4d5dba1446b15fedf886ba))
* return a fresh validate success result, not a shared object ([4fe8e87](https://github.com/cperfect/urnfield-ts/commit/4fe8e874bb654818db6fc442a22fa4f071152bf8))
* treat ^ as literal inside glob character classes ([5f695d7](https://github.com/cperfect/urnfield-ts/commit/5f695d7b7d0d31cb2c375a6175dafb6fb636c213))
* validate the full payload in format() before rendering ([5223759](https://github.com/cperfect/urnfield-ts/commit/52237591ccaed9344dfb26c803d79d16caed9ec5))
## 1.0.0 (2026-06-27)

### Features

* implement glob dialect and NSS schema validation ([4475db9](https://github.com/cperfect/urnfield-ts/commit/4475db975a55b1d3ba89f75db318a3c78d72e11b))
* implement URN equivalence (equals) ([2dd5b0f](https://github.com/cperfect/urnfield-ts/commit/2dd5b0f5dffd9a8a8157ffa4db062d459bab766b))
* implement URN parsing (parse, tryParse) ([3498e25](https://github.com/cperfect/urnfield-ts/commit/3498e25499b5226adff73235505254facdbc134e))
* implement well-formedness and canonical formatting ([616ef91](https://github.com/cperfect/urnfield-ts/commit/616ef916cdf9ee039ca243d63b3f041868c3300a))
* scaffold types, errors, and conformance test harness ([9be9380](https://github.com/cperfect/urnfield-ts/commit/9be938038fa0cde191e47c720b8140c3076a0a92))

### Bug Fixes

* correct repository url to urnfield-ts ([60dd6b0](https://github.com/cperfect/urnfield-ts/commit/60dd6b0eefd60b187983acb5d54427ccd25230ec))
* guard isWellFormed against null/non-object inputs ([e4a25c0](https://github.com/cperfect/urnfield-ts/commit/e4a25c0e240ab84450d94dd95ef1f7d631859d06))
* keep validate non-throwing on malformed schema patterns ([fd9b843](https://github.com/cperfect/urnfield-ts/commit/fd9b843540b6354572b0cfb2109d3e61813db090))
* reject empty ?= / ?+ items and empty keys when parsing ([21d05ca](https://github.com/cperfect/urnfield-ts/commit/21d05ca6f9212f5b08c50a970c537885e085e5e2))
* resolve conformance fixtures relative to the loader, not cwd ([08c0332](https://github.com/cperfect/urnfield-ts/commit/08c0332fc772dbb54d4d5dba1446b15fedf886ba))
* return a fresh validate success result, not a shared object ([4fe8e87](https://github.com/cperfect/urnfield-ts/commit/4fe8e874bb654818db6fc442a22fa4f071152bf8))
* treat ^ as literal inside glob character classes ([5f695d7](https://github.com/cperfect/urnfield-ts/commit/5f695d7b7d0d31cb2c375a6175dafb6fb636c213))
* validate the full payload in format() before rendering ([5223759](https://github.com/cperfect/urnfield-ts/commit/52237591ccaed9344dfb26c803d79d16caed9ec5))
