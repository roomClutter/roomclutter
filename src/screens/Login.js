import React, { useState } from 'react'

export default function Login(props) {
  const[input, setInput] = useState("");

  return (
    <div className="login">
      <span className="login-text">Room Clutter</span>
      <input onChange={e=>setInput(e.target.value)} value={input} className="login-input" placeholder="Enter password" type="text" />
      <button onClick={() => props.handleLogin(input)} className="login-button" type="submit">Submit</button>
      
    </div> 
  )
}


//<button onClick={() => props.handleLogin(input)} className="login-button" type="submit">Submit</button>