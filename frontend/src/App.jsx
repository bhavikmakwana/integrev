import React from 'react'
import './styles.css'
import logo from './assets/logo.svg'
import menuIcon from './assets/menu.svg'
import avatar from './assets/user.svg'
import DealForm from './components/DealForm'
import AdminDashboard from './components/AdminDashboard'
import DealsList from './components/DealsList' 

export default function App(){
  const [view, setView] = React.useState('form');
  return (
    <div className="app">
      <header className="app-header card">
        <img src={logo} className="logo" alt="logo" />
        <div className="app-title">Duplicate Deal Checker</div>
        <div className="spacer" />
        <div className="user"><img src={avatar} className="avatar" alt="user" /> Welcome, User</div>
        <img src={menuIcon} className="menu-icon" alt="menu" />
      </header>

      <div className="controls">
        <button className={`btn ${view==='form' ? 'btn-active' : ''}`} onClick={()=>setView('form')}>Deal Form</button>
        <button className={`btn ${view==='list' ? 'btn-active' : ''}`} onClick={()=>setView('list')}>List</button>
        <button className={`btn ${view==='admin' ? 'btn-active' : ''}`} onClick={()=>setView('admin')}>Admin</button>
      </div>

      <div className="content">
        {view==='form' ? <DealForm /> : view==='list' ? <DealsList /> : <AdminDashboard />}
      </div>
    </div>
  )
}

