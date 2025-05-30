
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CRMContact } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseCRMManager = () => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const channelRef = useRef<any>(null);

  const loadContacts = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('priority_date', { ascending: true });

      if (error) throw error;

      const transformedContacts: CRMContact[] = data.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        priorityDate: new Date(contact.priority_date),
        createdAt: new Date(contact.created_at)
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Ocorreu um erro ao carregar os contatos do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    loadContacts();

    const debouncedReload = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!loadingRef.current) {
          loadContacts();
        }
      }, 500);
    };

    const channel = supabase
      .channel('crm-contacts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crm_contacts'
      }, debouncedReload)
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadContacts]);

  const addContact = async (contactData: Omit<CRMContact, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .insert({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          subject: contactData.subject,
          priority_date: contactData.priorityDate.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Erro ao criar contato",
        description: "Ocorreu um erro ao criar o contato.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<CRMContact>) => {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.priorityDate !== undefined) updateData.priority_date = updates.priorityDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('crm_contacts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Erro ao atualizar contato",
        description: "Ocorreu um erro ao atualizar o contato.",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Erro ao excluir contato",
        description: "Ocorreu um erro ao excluir o contato.",
        variant: "destructive"
      });
    }
  };

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact
  };
};
