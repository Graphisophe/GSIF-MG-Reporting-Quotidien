import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Contact, SOURCES, CHANNELS, INTEREST_LEVELS, ACTIONS_TAKEN, STATUSES, LEVELS } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ContactFormProps {
  contact?: Contact | null;
  onSave: (data: Contact, addAnother: boolean) => void;
  onClose: () => void;
}

export function ContactForm({ contact, onSave, onClose }: ContactFormProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const { register, control, handleSubmit, reset, formState: { errors }, setFocus, setValue, watch, getValues, trigger } = useForm<Contact>({
    defaultValues: contact || {
      date: today,
      lastName: '',
      fatherPhone: '',
      motherPhone: '',
      children: [{ firstName: '', birthDate: '', requestedLevel: '___' }],
      source: '___',
      channel: '___',
      interestLevel: '___',
      actionTaken: '___',
      status: '___',
      appointmentDate: '',
      internalNotes: '',
      sensitivePoints: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children"
  });

  const actionTakenValue = watch('actionTaken');

  useEffect(() => {
    if (actionTakenValue !== 'rendez-vous fixé') {
      setValue('appointmentDate', '');
    }
  }, [actionTakenValue, setValue]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'fatherPhone' | 'motherPhone') => {
    const formatted = formatPhone(e.target.value);
    setValue(fieldName, formatted, { shouldValidate: true });
    trigger(fieldName === 'fatherPhone' ? 'motherPhone' : 'fatherPhone');
  };

  useEffect(() => {
    setFocus('lastName');
  }, [setFocus]);

  const onSubmit = (data: Contact, addAnother: boolean) => {
    onSave(data, addAnother);
    if (addAnother) {
      reset({
        ...data,
        lastName: '',
        fatherPhone: '',
        motherPhone: '',
        children: [{ firstName: '', birthDate: '', requestedLevel: LEVELS[0] }],
        appointmentDate: '',
        internalNotes: '',
        sensitivePoints: ''
      });
      setFocus('lastName');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            {contact?.id ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Section 1: Informations de base */}
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-2">Famille</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date du contact *</label>
                <input type="date" {...register('date', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de famille *</label>
                <input type="text" {...register('lastName', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow" placeholder="Ex: Dupont" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone Père *</label>
                <input 
                  type="tel" 
                  {...register('fatherPhone', { 
                    validate: (value) => {
                      const mother = getValues('motherPhone');
                      if (!value && !mother) return "Au moins un numéro est requis";
                      if (value && !/^([0-9]{2}\s?[0-9]{3}\s?[0-9]{3})?$/.test(value)) return "Le numéro doit contenir 8 chiffres";
                      return true;
                    },
                    onChange: (e) => handlePhoneChange(e, 'fatherPhone')
                  })} 
                  className={`w-full px-3 py-2 border ${errors.fatherPhone ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow`} 
                  placeholder="Ex: 21 214 214" 
                />
                {errors.fatherPhone && <span className="text-xs text-red-500 mt-1">{errors.fatherPhone.message as string}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone Mère *</label>
                <input 
                  type="tel" 
                  {...register('motherPhone', { 
                    validate: (value) => {
                      const father = getValues('fatherPhone');
                      if (!value && !father) return "Au moins un numéro est requis";
                      if (value && !/^([0-9]{2}\s?[0-9]{3}\s?[0-9]{3})?$/.test(value)) return "Le numéro doit contenir 8 chiffres";
                      return true;
                    },
                    onChange: (e) => handlePhoneChange(e, 'motherPhone')
                  })} 
                  className={`w-full px-3 py-2 border ${errors.motherPhone ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow`} 
                  placeholder="Ex: 55 555 555" 
                />
                {errors.motherPhone && <span className="text-xs text-red-500 mt-1">{errors.motherPhone.message as string}</span>}
              </div>
            </div>

            {/* Section 2: Enfant */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Enfants</h3>
                <button
                  type="button"
                  onClick={() => append({ firstName: '', birthDate: '', requestedLevel: '___' })}
                  className="text-xs flex items-center bg-[#2C337B] text-white hover:bg-[#1e2354] font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
                >
                  <Plus className="w-3 h-3 mr-1" /> Ajouter
                </button>
              </div>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prénom de l'enfant *</label>
                        <input type="text" {...register(`children.${index}.firstName` as const, { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow" placeholder="Ex: Léo" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance *</label>
                        <input type="date" {...register(`children.${index}.birthDate` as const, { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Niveau demandé *</label>
                        <select {...register(`children.${index}.requestedLevel` as const)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white">
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Suivi Commercial */}
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-2">Suivi Commercial</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <select {...register('source')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white text-sm">
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Echange</label>
                  <select {...register('channel')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white text-sm">
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Niveau d'intérêt</label>
                <select {...register('interestLevel')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white">
                  {INTEREST_LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Action faite *</label>
                  <select {...register('actionTaken', { validate: v => v !== '___' })} className={`w-full px-3 py-2 border ${errors.actionTaken ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white text-sm`}>
                    {ACTIONS_TAKEN.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.actionTaken && <span className="text-xs text-red-500 mt-1">Ce champ est requis</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
                  <select {...register('status', { validate: v => v !== '___' })} className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow bg-white text-sm font-medium`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.status && <span className="text-xs text-red-500 mt-1">Ce champ est requis</span>}
                </div>
              </div>

              {actionTakenValue === 'rendez-vous fixé' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RDV prévu *</label>
                  <input type="datetime-local" {...register('appointmentDate', { required: true })} className={`w-full px-3 py-2 border ${errors.appointmentDate ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow`} />
                  {errors.appointmentDate && <span className="text-xs text-red-500 mt-1">Ce champ est requis</span>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes internes (optionnel)</label>
              <textarea {...register('internalNotes')} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2C337B] focus:border-[#2C337B] outline-none transition-shadow resize-none" placeholder="Informations pour l'équipe..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Points sensibles / remarques (optionnel)</label>
              <textarea {...register('sensitivePoints')} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E9454C] focus:border-[#E9454C] outline-none transition-shadow resize-none" placeholder="Frais de scolarité, distance, etc..." />
            </div>
          </div>
        </form>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit((d) => onSubmit(d, false))} className="px-6 py-2 bg-[#2C337B] text-white font-medium hover:bg-[#1e2354] rounded-lg transition-colors shadow-sm">
            {contact?.id ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
