import firebase_admin
import csv
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('avantifellows-firebase-adminsdk-71e85-0e67a488ed.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

print(db.collections("HaryanaSchools"))