import { useState } from 'react';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', task: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addEntry = () => {
    if (form.name && form.email && form.task) {
      setEntries([...entries, form]);
      setForm({ name: '', email: '', task: '' }); // clear form
    }
  };

  return (
    <div className="app-container">
      <h2>Add Member Task</h2>

      <div className="input-row">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="task"
          placeholder="Task"
          value={form.task}
          onChange={handleChange}
        />
        <button onClick={addEntry}>➕</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.name}</td>
              <td>{entry.email}</td>
              <td>{entry.task}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
