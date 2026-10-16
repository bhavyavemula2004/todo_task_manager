from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Task(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(100), nullable=False)
  description = db.Column(db.Text, nullable=True)
  priority = db.Column(db.String(20), default='High')  # High, Medium, Low
  status = db.Column(
      db.String(20), default='In progress'
  )  # In progress, Completed, Pending
  created_by = db.Column(db.String(50), default='Maia')
  date_assigned = db.Column(
      db.String(20), default=datetime.now().strftime('%d/%m/%Y')
  )
  due_date = db.Column(db.String(20), nullable=True)

  def to_dict(self):
    return {
        'id': self.id,
        'title': self.title,
        'description': self.description,
        'priority': self.priority,
        'status': self.status,
        'created_by': self.created_by,
        'date_assigned': self.date_assigned,
        'due_date': self.due_date,
    }


with app.app_context():
  db.create_all()


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
  tasks = Task.query.all()
  return jsonify([task.to_dict() for task in tasks])


@app.route('/api/tasks', methods=['POST'])
def add_task():
  data = request.json
  if not data or not data.get('title'):
    return jsonify({'error': 'Title is required'}), 400

  new_task = Task(
      title=data.get('title'),
      description=data.get('description', ''),
      priority=data.get('priority', 'High'),
      status=data.get('status', 'In progress'),
      created_by=data.get('created_by', 'Maia'),
      due_date=data.get('due_date', ''),
  )
  db.session.add(new_task)
  db.session.commit()
  return jsonify(new_task.to_dict()), 201


@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
  task = Task.query.get_or_404(id)
  data = request.json

  task.title = data.get('title', task.title)
  task.description = data.get('description', task.description)
  task.priority = data.get('priority', task.priority)
  task.status = data.get('status', task.status)
  task.created_by = data.get('created_by', task.created_by)
  task.due_date = data.get('due_date', task.due_date)

  db.session.commit()
  return jsonify(task.to_dict())


@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
  task = Task.query.get_or_404(id)
  db.session.delete(task)
  db.session.commit()
  return jsonify({'message': 'Task deleted successfully'})


if __name__ == '__main__':
  app.run(debug=True, port=5000)