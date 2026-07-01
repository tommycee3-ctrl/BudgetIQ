# BudgetIQ Project

BudgetIQ is a private self-hosted finance app for Tommy and Ashley.

## Core Goals

- Separate Tommy and Ashley accounts
- Shared household dashboard
- Login with remember-me sessions
- SQLite database
- Budget tracking
- Bills tracking
- Spending card tracking
- Savings goal logic
- Amazon Flex income tracking
- SimpleFIN bank transaction sync
- Auto-categorization rules
- Backups and restore
- Cloudflare Tunnel remote access

## Budget Logic

- Bills Remaining = unpaid bills only
- Spending Budget = grocery budget + misc + spending card budget
- Available to Save = pay + income - total bill budget - spending budget - checking cushion
- Cash Left = pay + income - paid bills - actual spending - actual saved

## Build Order

1. Server foundation
2. Login system
3. SQLite database
4. Tommy and Ashley profiles
5. Budget dashboard
6. Bank sync
7. Auto-categorization
8. Backups
9. Cloudflare Tunnel
