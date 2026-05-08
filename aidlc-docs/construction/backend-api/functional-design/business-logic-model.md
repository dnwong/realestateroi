# Business Logic Model: backend-api

## Workflow 1: User Registration

```
POST /api/auth/register { email, password }

1. Validate input (email format, password min 8 chars)
2. Check if email already exists in users table
   → EXISTS: return 409 Conflict
3. Hash password: bcrypt.hash(password, 12)
4. Insert user record into users table
5. Return 201 { success: true, data: { user: { id, email, createdAt } } }
```

## Workflow 2: User Login

```
POST /api/auth/login { email, password }

1. Validate input
2. Check login attempt tracker for email
   → LOCKED: return 429 (generic message)
3. Find user by email
   → NOT FOUND: increment attempt counter, return 401 (generic message)
4. bcrypt.compare(password, user.password)
   → MISMATCH: increment attempt counter, check lockout threshold, return 401
5. Reset attempt counter for email
6. Create session: req.session.userId = user.id, req.session.email = user.email
7. Return 200 { success: true, data: { user: { id, email } } }
```

## Workflow 3: Property Search

```
GET /api/search?query=78701&type=zip&filters[bedroomsMin]=3...

1. Validate and parse query params (joi schema)
2. Build SearchQuery object
3. Parallel fetch:
   [propertyResult, colData] = await Promise.all([
     propertyRepository.findBySearch(query),
     costOfLivingRepository.findByLocation(query.query).catch(() => null)
   ])
4. For each property in propertyResult.listings:
   a. Find matching rental rate from rentalRepository.findByArea(zipCode, filters)
      (fetch once per unique zipCode, cache results in-request)
   b. Calculate ROI: roiService.calculate(property, rentalRate, colData, roiConfig)
5. Sort results by roiScore descending
6. Return SearchResponse { success: true, data: results, total, usingFallback }
```

## Workflow 4: ROI Recalculation

```
POST /api/roi/calculate { properties[], roiConfig }

1. Validate roiConfig (vacancyRate 0-1, maintenanceRate 0-1, etc.)
2. For each property in properties:
   roiService.calculate(property.property, property.rentalRate, property.costOfLiving, roiConfig)
3. Return updated PropertyResult[] with new scores
```

## Workflow 5: ROI Pipeline (ROIService)

```
calculate(property, rentalRate, col, config):

1. annualRent = (rentalRate?.estimatedMonthlyRent ?? 0) * 12
   IF annualRent === 0: return { roiScore: 0, breakdown: { missingRentalData: true } }

2. CapRateStep (always enabled):
   annualExpenses = property.propertyTax
   capRate = (annualRent - annualExpenses) / property.price

3. VacancyStep (if config.enableVacancy):
   vacancyAdj = annualRent * (config.vacancyRate ?? 0.08)
   capRate -= vacancyAdj / property.price

4. MaintenanceStep (if config.enableMaintenance):
   maintAdj = property.price * (config.maintenanceRate ?? 0.01)
   capRate -= maintAdj / property.price

5. PropertyTaxStep (already included in step 2 via property.propertyTax)

6. CostOfLivingStep (if config.enableCostOfLiving && col):
   colFactor = 1 + (col.overallIndex - 100) / 100
   roiScore = capRate * colFactor
   ELSE: roiScore = capRate

7. Return { roiScore, breakdown: { capRate, vacancyAdjustment, maintenanceAdjustment, colAdjustment, annualRent, annualExpenses } }
```

## Workflow 6: Saved Search CRUD

```
POST /api/saved-searches { name, query }
1. Validate: name non-empty, query valid SearchQuery
2. Count existing saved searches for user → if >= 50: return 422
3. Insert into saved_searches table
4. Return 201 with created record

DELETE /api/saved-searches/:id
1. Find saved search by id WHERE user_id = req.session.userId
   → NOT FOUND or wrong owner: return 404
2. Delete record
3. Return 204
```
