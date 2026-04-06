import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Register() {

    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const Navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('https://academic-repo-evrb.onrender.com/register', {name, email, password})
        .then(result => {
            console.log(result);
            alert('User Created Successfully!');
            Navigate('/login');
        })
        .catch(err => console.log(err))
    }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow-sm" style={{ width: '22rem' }}>
        <div className="card-body">
          <h4 className="text-center mb-4">Register</h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/*<div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm password"
                //required
                //onChange={(e) => setPassword(e.target.value)}
              />
            </div>*/}

            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </form>

          <div>
            <label className="form-label">Already have an Account?</label>
            <Link to='/login' className="btn btn-primary w-100" >
                Login
            </Link>
        </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
