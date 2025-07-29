# Testing Guide for SettleUp

## Prerequisites
- PostgreSQL database running on localhost:5432
- Database name: `settle_up`
- Username: `postgres`
- Password: `newpassword` (as configured in `application.properties`)

## Step 1: Start the Application

### Option A: Using Maven (if installed)
```bash
mvn spring-boot:run
```

### Option B: Using IDE
- Open the project in your IDE (IntelliJ IDEA, Eclipse, VS Code)
- Run the `SettleUpApplication.java` main class

### Option C: Using Maven Wrapper (if available)
```bash
./mvnw spring-boot:run
```

## Step 2: Verify Data Loading

The application will automatically load sample data when it starts. You should see output like:
```
Initializing database with sample data...
Sample data loaded successfully!
Created 5 users
Created 3 groups
Created 5 expenses
```

## Step 3: Test the API Endpoints

### 3.1 Test Data Summary
```bash
curl http://localhost:8080/api/test/data-summary
```
This will show you all users, groups, and expenses in the database.

### 3.2 Test User Balances
```bash
curl http://localhost:8080/api/test/user-balances
```
This will show each user's balance across all groups.

### 3.3 Test Group Splits
```bash
# Test Roommates group (ID: 1)
curl http://localhost:8080/api/test/group/1/splits

# Test Vacation Trip group (ID: 2)
curl http://localhost:8080/api/test/group/2/splits

# Test Dinner Club group (ID: 3)
curl http://localhost:8080/api/test/group/3/splits
```

## Step 4: Test Split Management Endpoints

### 4.1 Get All Splits for a User
```bash
curl http://localhost:8080/api/splits/user/1
```

### 4.2 Get All Splits for an Expense
```bash
curl http://localhost:8080/api/splits/expense/1
```

### 4.3 Get User's Balance in a Group
```bash
curl http://localhost:8080/api/splits/balance/user/1/group/1
```

### 4.4 Get Pending Splits for a Group
```bash
curl http://localhost:8080/api/splits/pending/group/1
```

### 4.5 Mark a Split as Paid
```bash
curl -X PUT http://localhost:8080/api/splits/1/mark-paid
```

### 4.6 Update Split Amount
```bash
curl -X PUT "http://localhost:8080/api/splits/1/amount?newAmount=50.00"
```

## Step 5: Test Core Application Endpoints

### 5.1 Get All Users
```bash
curl http://localhost:8080/api/users
```

### 5.2 Get All Groups
```bash
curl http://localhost:8080/api/groups
```

### 5.3 Get All Expenses
```bash
curl http://localhost:8080/api/expense
```

### 5.4 Add a New Expense
```bash
curl -X POST "http://localhost:8080/api/expense/add?groupId=1&paidById=1&amount=100.00&description=Test%20Expense"
```

## Step 6: Sample Data Overview

### Users Created:
- Alice Johnson (ID: 1)
- Bob Smith (ID: 2)
- Charlie Brown (ID: 3)
- Diana Prince (ID: 4)
- Eve Wilson (ID: 5)

### Groups Created:
- Roommates (ID: 1) - Alice, Bob, Charlie
- Vacation Trip (ID: 2) - Alice, Bob, Charlie, Diana, Eve
- Dinner Club (ID: 3) - Alice, Diana, Eve

### Sample Expenses:
- Monthly Rent: $1500 (Roommates, paid by Alice)
- Electricity and Water: $200 (Roommates, paid by Bob)
- Hotel Booking: $800 (Vacation Trip, paid by Diana)
- Group Dinner: $300 (Vacation Trip, paid by Eve)
- Italian Restaurant: $120 (Dinner Club, paid by Alice)

## Step 7: Expected Results

### Roommates Group Balances:
- Alice: Should owe $500 (her share of rent) - $66.67 (her share of utilities) = $433.33
- Bob: Should owe $500 (his share of rent) - $200 (he paid utilities) = $300
- Charlie: Should owe $500 (his share of rent) - $66.67 (his share of utilities) = $433.33

### Vacation Trip Group Balances:
- Each member should owe $160 (hotel) + $60 (dinner) = $220
- Diana: Should owe $220 - $800 (she paid hotel) = -$580 (others owe her)
- Eve: Should owe $220 - $300 (she paid dinner) = -$80 (others owe her)

## Troubleshooting

### Database Connection Issues:
1. Ensure PostgreSQL is running
2. Check database credentials in `application.properties`
3. Verify database `settle_up` exists

### Application Won't Start:
1. Check if port 8080 is available
2. Verify all dependencies are resolved
3. Check console logs for error messages

### Data Not Loading:
1. Check if database already has data (DataLoader skips if data exists)
2. Clear database tables and restart application
3. Check console logs for DataLoader output

## Using Postman or Similar Tools

If you prefer using Postman or similar API testing tools:
1. Import the endpoints above
2. Set base URL to `http://localhost:8080`
3. Test each endpoint to verify functionality

## Next Steps

After testing, you can:
1. Add more test data using the API endpoints
2. Test different split scenarios
3. Move on to implementing Step 2 (Balance Calculation Logic)
4. Start building the frontend application 