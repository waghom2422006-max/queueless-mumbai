from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

# SQLite Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///queueless.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Tables
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    area = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    crowd_level = db.Column(db.String(20), nullable=False)
    estimated_wait = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()
    if not Location.query.first():
        loc1 = Location(name="Andheri RTO", area="Andheri West", category="RTO")
        loc2 = Location(name="Passport Seva Kendra", area="Malad", category="Passport")
        loc3 = Location(name="Cooper Hospital OPD", area="Juhu", category="Hospital")
        loc4 = Location(name="Samaj Kalyan Office", area="Worli", category="Government")
        db.session.add_all([loc1, loc2, loc3, loc4])
        db.session.commit()

# API: Locations + User Count (Confidence Score)
@app.route('/api/locations', methods=['GET'])
def get_locations():
    locations = Location.query.all()
    result = []
    for loc in locations:
        reports = Report.query.filter_by(location_id=loc.id).order_by(Report.timestamp.desc()).all()
        latest_report = reports[0] if reports else None
        
        result.append({
            "id": loc.id,
            "name": loc.name,
            "area": loc.area,
            "category": loc.category,
            "current_crowd": latest_report.crowd_level if latest_report else "No Data Yet",
            "estimated_wait": latest_report.estimated_wait if latest_report else 0,
            "last_updated": latest_report.timestamp.strftime("%I:%M %p") if latest_report else "N/A",
            "user_count": len(reports) # किती लोकांनी रिपोर्ट केलाय ते मोजणे
        })
    return jsonify(result)

# API: Submit Report
@app.route('/api/report', methods=['POST'])
def add_report():
    data = request.json
    new_report = Report(
        location_id=data['location_id'],
        crowd_level=data['crowd_level'],
        estimated_wait=data['estimated_wait']
    )
    db.session.add(new_report)
    db.session.commit()
    return jsonify({"message": "Report updated successfully!"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)