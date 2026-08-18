import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../features/auth/authSlice';

const navClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link';

export default function Layout() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(signOut());
    navigate('/login');
  };

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          Santa Media
        </Link>

        {user && (
          <nav>
            <NavLink end className={navClass} to="/">
              My Library
            </NavLink>

            <NavLink className={navClass} to="/upload">
              Upload
            </NavLink>

            <NavLink className={navClass} to="/search">
              Search
            </NavLink>

            <button onClick={onLogout}>Log out</button>
          </nav>
        )}
      </header>

      <main className="page">
        <Outlet />
      </main>
    </>
  );
}