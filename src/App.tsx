import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PasswordGenerator from './pages/PasswordGenerator'
import PasswordList from './pages/PasswordList'
import PasswordDetail from './pages/PasswordDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/generator" replace />} />
          <Route path="generator" element={<PasswordGenerator />} />
          <Route path="list" element={<PasswordList />} />
          <Route path="password/:id" element={<PasswordDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
