import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContactTable } from './components/ContactTable';
import { ContactForm } from './components/ContactForm';
import { Auth } from './components/Auth';
import { Contact, SOURCES, CHANNELS, INTEREST_LEVELS, STATUSES, LEVELS } from './types';
import { generatePDF } from './utils/pdfGenerator';
import { Plus, Download, FilterX, LogOut } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, where } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(today);
  const [filterSource, setFilterSource] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterInterest, setFilterInterest] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Summary
  const [sensitivePointsSummary, setSensitivePointsSummary] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      let q = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let fetchedContacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Contact[];

        // Apply client-side filters
        if (filterDate) fetchedContacts = fetchedContacts.filter(c => c.date === filterDate);
        if (filterSource) fetchedContacts = fetchedContacts.filter(c => c.source === filterSource);
        if (filterChannel) fetchedContacts = fetchedContacts.filter(c => c.channel === filterChannel);
        if (filterInterest) fetchedContacts = fetchedContacts.filter(c => c.interestLevel === filterInterest);
        if (filterStatus) fetchedContacts = fetchedContacts.filter(c => c.status === filterStatus);
        
        if (filterLevel) {
          fetchedContacts = fetchedContacts.filter(c => 
            c.children.some(child => child.requestedLevel.includes(filterLevel))
          );
        }
        
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          fetchedContacts = fetchedContacts.filter(c => 
            c.lastName.toLowerCase().includes(lowerQuery) ||
            (c.fatherPhone && c.fatherPhone.includes(lowerQuery)) ||
            (c.motherPhone && c.motherPhone.includes(lowerQuery)) ||
            c.children.some(child => child.firstName.toLowerCase().includes(lowerQuery))
          );
        }

        setContacts(fetchedContacts);
        setIsLoading(false);
      }, (error) => {
        console.error('Firestore Error:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up snapshot:', error);
      setIsLoading(false);
    }
  }, [user, isAuthReady, filterDate, filterSource, filterChannel, filterInterest, filterStatus, filterLevel, searchQuery]);

  const handleSaveContact = async (contact: Contact, addAnother: boolean) => {
    if (!user) return;
    
    try {
      const contactData = {
        ...contact,
        userId: user.uid,
        updatedAt: serverTimestamp()
      };
      
      delete contactData.id; // Remove ID before saving

      if (contact.id) {
        await updateDoc(doc(db, 'contacts', contact.id), contactData);
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...contactData,
          createdAt: serverTimestamp()
        });
      }
      
      if (!addAnother) {
        setIsFormOpen(false);
        setEditingContact(null);
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Erreur lors de l\'enregistrement du contact.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  const handleConsolidateContact = async (contact: Contact) => {
    if (!contact.id || !user) return;
    try {
      await updateDoc(doc(db, 'contacts', contact.id), {
        status: 'confirmé',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to consolidate contact:', error);
      alert('Erreur lors de la consolidation.');
    }
  };

  const resetFilters = () => {
    setFilterDate('');
    setFilterSource('');
    setFilterChannel('');
    setFilterInterest('');
    setFilterStatus('');
    setFilterLevel('');
    setSearchQuery('');
  };

  const handleReset = async () => {
    if (!user) return;
    
    try {
      // Fetch all contacts for this user to ensure we delete everything, not just filtered ones
      const { getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'contacts'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'contacts', docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
      setIsResetModalOpen(false);
    } catch (error) {
      console.error('Failed to reset database:', error);
      alert('Erreur lors de la réinitialisation.');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C337B]"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const hasContacts = contacts.length > 0;
  const allConsolidated = hasContacts && contacts.every(c => c.status === 'confirmé');
  const canGeneratePdf = allConsolidated;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
          <p className="text-slate-500 text-sm mt-1">Suivi quotidien des demandes d'inscription</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={() => signOut(auth)}
            className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors shadow-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </button>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            disabled={!canGeneratePdf}
            title={!canGeneratePdf ? "Tous les contacts affichés doivent être consolidés pour générer le PDF" : ""}
            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-lg transition-colors shadow-sm font-medium ${canGeneratePdf ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Download className="w-4 h-4 mr-2" />
            Générer PDF
          </button>
          <button
            onClick={() => { setEditingContact(null); setIsFormOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-[#E9454C] text-white rounded-lg hover:bg-[#d13d44] transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau contact
          </button>
        </div>
      </div>

      <Dashboard contacts={contacts} />

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm font-medium"
        >
          Réinitialiser
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Rechercher (nom, prénom, tél)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none text-sm"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none text-sm bg-white"
          />
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none text-sm bg-white">
            <option value="">Toutes sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none text-sm bg-white">
            <option value="">Tous canaux</option>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none text-sm bg-white">
            <option value="">Tous statuts</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button onClick={resetFilters} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Réinitialiser les filtres">
            <FilterX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C337B]"></div>
        </div>
      ) : (
        <ContactTable
          contacts={contacts}
          onEdit={(c) => { setEditingContact(c); setIsFormOpen(true); }}
          onDelete={handleDeleteContact}
          onConsolidate={handleConsolidateContact}
        />
      )}

      {isFormOpen && (
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => { setIsFormOpen(false); setEditingContact(null); }}
        />
      )}

      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Générer le PDF du jour</h3>
            <p className="text-sm text-slate-600 mb-4">
              Rédigez une synthèse des points sensibles observés aujourd'hui (optionnel).
            </p>
            <textarea
              value={sensitivePointsSummary}
              onChange={(e) => setSensitivePointsSummary(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] outline-none resize-none mb-6"
              rows={4}
              placeholder="Ex: Beaucoup de questions sur les tarifs, forte demande pour le niveau CE1..."
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsPdfModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                Annuler
              </button>
              <button
                onClick={() => {
                  generatePDF(contacts, filterDate || today, sensitivePointsSummary);
                  setIsPdfModalOpen(false);
                }}
                className="px-6 py-2 bg-[#2C337B] text-white font-medium hover:bg-[#1e2354] rounded-lg transition-colors shadow-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Réinitialiser la base de données</h3>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir réinitialiser toute la base de données ? Cette action est irréversible et supprimera tous les contacts enregistrés.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-6 py-2 bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                ANNULER
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                CONFIRMER
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

