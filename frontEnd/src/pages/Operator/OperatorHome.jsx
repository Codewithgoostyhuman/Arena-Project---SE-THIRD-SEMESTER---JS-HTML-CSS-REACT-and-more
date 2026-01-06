import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

// API calls
const API_BASE = 'http://localhost:5000';

const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Operator Dashboard</h1>
          {user && <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.9rem' }}>Welcome, {user.name}</p>}
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </header>

      <nav style={styles.nav}>
        <button
          style={{...styles.navBtn, ...(activeTab === 'users' && styles.navBtnActive)}}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          style={{...styles.navBtn, ...(activeTab === 'games' && styles.navBtnActive)}}
          onClick={() => setActiveTab('games')}
        >
          🎮 Game Management
        </button>
        <button
          style={{...styles.navBtn, ...(activeTab === 'styles' && styles.navBtnActive)}}
          onClick={() => setActiveTab('styles')}
        >
          🏆 Tournament Styles
        </button>
        <button
          style={{...styles.navBtn, ...(activeTab === 'ratings' && styles.navBtnActive)}}
          onClick={() => setActiveTab('ratings')}
        >
          📊 Rating Formulas
        </button>
      </nav>

      <main style={styles.content}>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'games' && <GameManagement />}
        {activeTab === 'styles' && <TournamentStyles />}
        {activeTab === 'ratings' && <RatingFormulas />}
      </main>
    </div>
  );
}

// ============================================
// USER MANAGEMENT
// ============================================
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchWithAuth('/users');
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await fetchWithAuth(`/user/activate/${userId}`, { method: 'PATCH' });
      loadUsers();
    } catch (err) {
      alert('Error activating user');
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await fetchWithAuth(`/user/deactivate/${userId}`, { method: 'PATCH' });
      loadUsers();
    } catch (err) {
      alert('Error deactivating user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetchWithAuth(`/user/${userId}`, { method: 'DELETE' });
      loadUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (loading) return <div style={styles.loading}>Loading users...</div>;

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>User Management</h2>
        <div style={styles.stats}>
          <span>Total Users: {users.length}</span>
          <span>Active: {users.filter(u => u.status === 'active').length}</span>
          <span>Inactive: {users.filter(u => u.status === 'inactive').length}</span>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Stats</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} style={styles.tr}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={getRoleBadgeStyle(user.role)}>{user.role}</span>
              </td>
              <td style={styles.td}>
                <span style={getStatusBadgeStyle(user.status)}>{user.status}</span>
              </td>
              <td style={styles.td}>
                {user.role === 'player' && (
                  <span style={{ fontSize: '0.85rem' }}>
                    W:{user.stats?.wins || 0} L:{user.stats?.losses || 0} D:{user.stats?.draws || 0} Pts:{user.stats?.points || 0}
                  </span>
                )}
              </td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  {user.status === 'inactive' ? (
                    <button 
                      style={styles.btnActivate}
                      onClick={() => handleActivate(user._id)}
                    >
                      Activate
                    </button>
                  ) : (
                    <button 
                      style={styles.btnDeactivate}
                      onClick={() => handleDeactivate(user._id)}
                    >
                      Deactivate
                    </button>
                  )}
                  <button 
                    style={styles.btnDelete}
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// GAME MANAGEMENT
// ============================================
function GameManagement() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'TicTacToe',
    minPlayers: 2,
    maxPlayers: 2,
    rules: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await fetchWithAuth('/games');
      setGames(data);
    } catch (err) {
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/game/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchWithAuth('/game', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        type: 'TicTacToe',
        minPlayers: 2,
        maxPlayers: 2,
        rules: '',
        status: 'active'
      });
      loadGames();
    } catch (err) {
      alert('Error saving game');
    }
  };

  const handleEdit = (game) => {
    setFormData(game);
    setEditingId(game._id);
    setShowForm(true);
  };

  const handleDelete = async (gameId) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await fetchWithAuth(`/game/${gameId}`, { method: 'DELETE' });
      loadGames();
    } catch (err) {
      alert('Error deleting game');
    }
  };

  if (loading) return <div style={styles.loading}>Loading games...</div>;

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>Game Management</h2>
        <button 
          style={styles.btnPrimary}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              type: 'TicTacToe',
              minPlayers: 2,
              maxPlayers: 2,
              rules: '',
              status: 'active'
            });
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Game'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>{editingId ? 'Edit Game' : 'Create New Game'}</h3>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Game Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Game Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={styles.input}
                required
              >
                <option value="TicTacToe">Tic Tac Toe</option>
                <option value="RockPaperScissors">Rock Paper Scissors</option>
                <option value="NumberGuessDuel">Number Guess Duel</option>
              </select>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Min Players</label>
              <input
                type="number"
                value={formData.minPlayers}
                onChange={(e) => setFormData({...formData, minPlayers: parseInt(e.target.value)})}
                style={styles.input}
                min="2"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Max Players</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                style={styles.input}
                min="2"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={styles.input}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{...styles.input, minHeight: '80px'}}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rules *</label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              style={{...styles.input, minHeight: '100px'}}
              required
            />
          </div>

          <button type="submit" style={styles.btnPrimary}>
            {editingId ? 'Update Game' : 'Create Game'}
          </button>
        </form>
      )}

      <div style={styles.cardsGrid}>
        {games.map(game => (
          <div key={game._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>{game.name}</h3>
              <span style={getStatusBadgeStyle(game.status)}>{game.status}</span>
            </div>
            <p style={styles.cardDescription}>{game.description}</p>
            <div style={styles.cardDetails}>
              <span><strong>Type:</strong> {game.type}</span>
              <span><strong>Players:</strong> {game.minPlayers}-{game.maxPlayers}</span>
            </div>
            <div style={styles.cardRules}>
              <strong>Rules:</strong>
              <p>{game.rules}</p>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.btnEdit} onClick={() => handleEdit(game)}>Edit</button>
              <button style={styles.btnDelete} onClick={() => handleDelete(game._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TOURNAMENT STYLES
// ============================================
function TournamentStyles() {
  const styles_data = [
    {
      name: 'Round Robin',
      type: 'RoundRobin',
      description: 'Each player plays every other player once',
      details: 'Best for: Small to medium sized tournaments where you want everyone to play each other',
      matches: 'n(n-1)/2 matches for n players',
      pros: ['Fair - everyone plays everyone', 'No luck involved', 'Clear ranking'],
      cons: ['Many matches required', 'Takes longer to complete']
    },
    {
      name: 'Double Round Robin',
      type: 'DoubleRoundRobin',
      description: 'Each player plays every other player twice (home and away)',
      details: 'Best for: When you want to minimize home advantage and get more accurate results',
      matches: 'n(n-1) matches for n players',
      pros: ['Very fair', 'Eliminates home advantage', 'Most accurate ranking'],
      cons: ['Twice as many matches', 'Very time consuming']
    },
    {
      name: 'Single Elimination',
      type: 'SingleElimination',
      description: 'Knockout tournament - lose once and you\'re eliminated',
      details: 'Best for: Large tournaments where time is limited',
      matches: 'n-1 matches for n players',
      pros: ['Fast', 'Exciting', 'Clear winner'],
      cons: ['Unlucky early draw', 'Unfair to losers', 'No second chances']
    }
  ];

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>Tournament Styles</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          These are the available tournament formats for league organizers
        </p>
      </div>

      <div style={styles.cardsGrid}>
        {styles_data.map(style => (
          <div key={style.type} style={{...styles.card, borderLeft: '4px solid #007bff'}}>
            <div style={styles.cardHeader}>
              <h3>{style.name}</h3>
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                {style.type}
              </span>
            </div>
            <p style={styles.cardDescription}>{style.description}</p>
            
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>{style.details}</p>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
                <strong>Matches:</strong> {style.matches}
              </p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#4caf50' }}>Pros:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {style.pros.map((pro, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong style={{ color: '#f44336' }}>Cons:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {style.cons.map((con, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#666' }}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RATING FORMULAS
// ============================================
function RatingFormulas() {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    winnerScore: 3,
    loserScore: 0,
    drawScore: 1,
    isDefault: false,
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
    try {
      const data = await fetchWithAuth('/rating-formulas');
      setFormulas(data);
    } catch (err) {
      console.error('Error loading formulas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/rating-formula/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchWithAuth('/rating-formula', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        winnerScore: 3,
        loserScore: 0,
        drawScore: 1,
        isDefault: false,
        status: 'active'
      });
      loadFormulas();
    } catch (err) {
      alert('Error saving formula');
    }
  };

  const handleEdit = (formula) => {
    setFormData(formula);
    setEditingId(formula._id);
    setShowForm(true);
  };

  const handleDelete = async (formulaId) => {
    if (!confirm('Are you sure you want to delete this rating formula?')) return;
    try {
      await fetchWithAuth(`/rating-formula/${formulaId}`, { method: 'DELETE' });
      loadFormulas();
    } catch (err) {
      alert('Error deleting formula');
    }
  };

  if (loading) return <div style={styles.loading}>Loading formulas...</div>;

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>Rating Formulas</h2>
        <button 
          style={styles.btnPrimary}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              winnerScore: 3,
              loserScore: 0,
              drawScore: 1,
              isDefault: false,
              status: 'active'
            });
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Formula'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>{editingId ? 'Edit Rating Formula' : 'Create New Rating Formula'}</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Formula Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              placeholder="e.g., Standard Points, FIFA Style, Custom"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{...styles.input, minHeight: '80px'}}
              placeholder="Describe how this rating formula works"
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Winner Score *</label>
              <input
                type="number"
                value={formData.winnerScore}
                onChange={(e) => setFormData({...formData, winnerScore: parseFloat(e.target.value)})}
                style={styles.input}
                step="0.1"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Draw Score *</label>
              <input
                type="number"
                value={formData.drawScore}
                onChange={(e) => setFormData({...formData, drawScore: parseFloat(e.target.value)})}
                style={styles.input}
                step="0.1"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Loser Score *</label>
              <input
                type="number"
                value={formData.loserScore}
                onChange={(e) => setFormData({...formData, loserScore: parseFloat(e.target.value)})}
                style={styles.input}
                step="0.1"
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  style={{ marginRight: '8px' }}
                />
                Set as Default Formula
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={styles.input}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.btnPrimary}>
            {editingId ? 'Update Formula' : 'Create Formula'}
          </button>
        </form>
      )}

      <div style={styles.cardsGrid}>
        {formulas.map(formula => (
          <div key={formula._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>{formula.name}</h3>
              <div>
                {formula.isDefault && (
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: '#ffd54f',
                    color: '#f57c00',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}>
                    DEFAULT
                  </span>
                )}
                <span style={getStatusBadgeStyle(formula.status)}>{formula.status}</span>
              </div>
            </div>
            <p style={styles.cardDescription}>{formula.description}</p>
            
            <div style={styles.scoreGrid}>
              <div style={styles.scoreBox}>
                <div style={styles.scoreLabel}>Win</div>
                <div style={styles.scoreValue}>{formula.winnerScore}</div>
              </div>
              <div style={styles.scoreBox}>
                <div style={styles.scoreLabel}>Draw</div>
                <div style={styles.scoreValue}>{formula.drawScore}</div>
              </div>
              <div style={styles.scoreBox}>
                <div style={styles.scoreLabel}>Loss</div>
                <div style={styles.scoreValue}>{formula.loserScore}</div>
              </div>
            </div>

            <div style={styles.cardActions}>
              <button style={styles.btnEdit} onClick={() => handleEdit(formula)}>Edit</button>
              <button style={styles.btnDelete} onClick={() => handleDelete(formula._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getRoleBadgeStyle(role) {
  const colors = {
    operator: { bg: '#e3f2fd', color: '#1565c0' },
    leagueOwner: { bg: '#f3e5f5', color: '#7b1fa2' },
    player: { bg: '#e8f5e9', color: '#2e7d32' }
  };
  const c = colors[role] || { bg: '#f5f5f5', color: '#666' };
  return {
    padding: '4px 12px',
    backgroundColor: c.bg,
    color: c.color,
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '500'
  };
}

function getStatusBadgeStyle(status) {
  const active = status === 'active';
  return {
    padding: '4px 12px',
    backgroundColor: active ? '#e8f5e9' : '#ffebee',
    color: active ? '#2e7d32' : '#c62828',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '500'
  };
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  logoutBtn: {
    padding: '8px 20px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  nav: {
    display: 'flex',
    gap: '8px',
    padding: '20px 40px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd'
  },
  navBtn: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s'
  },
  navBtnActive: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff'
  },
  content: {
    padding: '40px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem',
    color: '#666'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1.2rem',
    color: '#666'
  },
  table: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #dee2e6'
  },
  tr: {
    borderBottom: '1px solid #dee2e6'
  },
  td: {
    padding: '16px',
    color: '#666'
  },
  actionBtns: {
    display: 'flex',
    gap: '8px'
  },
  btnActivate: {
    padding: '6px 12px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  btnDeactivate: {
    padding: '6px 12px',
    backgroundColor: '#ff9800',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  btnDelete: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  form: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: '#333',
    fontSize: '0.9rem'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  cardDescription: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  cardDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '12px'
  },
  cardRules: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#666'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px'
  },
  btnEdit: {
    padding: '8px 16px',
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '16px',
    marginBottom: '16px'
  },
  scoreBox: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '4px'
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#333'
  }
}