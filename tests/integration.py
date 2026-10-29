"""End-to-end HTTP smoke test. Run only against an isolated test deployment.
Creates two test accounts and one demo order; no payments are made.
"""
import os
import secrets
import requests

users = os.getenv('USERS_URL', 'http://127.0.0.1:58100')
orders = os.getenv('ORDERS_URL', 'http://127.0.0.1:58103')
products = os.getenv('PRODUCTS_URL', 'http://127.0.0.1:58102')

def call(method, base, path, expected, token=None, **kwargs):
    response = requests.request(method, base + path, timeout=120,
        headers={'Authorization': 'Bearer ' + token} if token else {}, **kwargs)
    assert response.status_code == expected, (path, response.status_code, response.text[:300])
    return response.json() if response.content else None

catalog = call('GET', products, '/products', 200)
assert len(catalog) >= 2
call('GET', users, '/users', 404)
call('GET', users, '/me', 401)
call('GET', orders, '/orders', 401)
accounts = []
for index in range(2):
    email = f'qa-{secrets.token_hex(6)}@example.com'
    password = secrets.token_urlsafe(18)
    call('POST', users, '/register', 201, json={'email': email, 'password': password})
    call('POST', users, '/register', 409, json={'email': email, 'password': password})
    call('POST', users, '/login', 401, json={'email': email, 'password': 'incorrect'})
    login = call('POST', users, '/login', 200, json={'email': email, 'password': password})
    assert 'password' not in login['user']
    identity = call('GET', users, '/me', 200, login['token'])
    assert identity['role'] == 'customer'
    accounts.append(login)
first, second = accounts
call('POST', orders, '/orders', 400, first['token'], json={'items':[]})
call('POST', orders, '/orders', 400, first['token'], json={'items':[{'productId':catalog[0]['id'],'quantity':-1}]})
order = call('POST', orders, '/orders', 201, first['token'], json={
    'userId': second['user']['id'], 'totalAmount': 0.01,
    'items':[{'productId':catalog[0]['id'], 'quantity':2}]})
assert order['userId'] == first['user']['id']
assert float(order['totalAmount']) == float(catalog[0]['price']) * 2
assert order['status']['name'] == 'Pending'
assert any(item['id'] == order['id'] for item in call('GET', orders, '/orders', 200, first['token']))
assert not any(item['id'] == order['id'] for item in call('GET', orders, '/orders', 200, second['token']))
call('GET', orders, f"/orders/user/{first['user']['id']}", 403, second['token'])
call('PUT', orders, f"/orders/{order['id']}/status", 403, first['token'], json={'statusId':2})
call('POST', users, '/logout', 200, first['token'])
call('GET', users, '/me', 401, first['token'])
call('GET', orders, '/orders', 401, first['token'])
print('PASS: catalog, registration, login, session expiry/logout, saved orders, server pricing, user isolation and admin access checks')
