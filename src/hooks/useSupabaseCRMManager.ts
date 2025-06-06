
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CRMContact } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseCRMManager = () => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadContacts = useCallback(async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        console.log('Loading CRM contacts from Supabase...');
      }
      
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

      if (!skipLoading) {
        console.log('CRM contacts loaded:', transformedContacts.length);
      }
      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      if (!skipLoading) {
        toast({
          title: "Erro ao carregar contatos",
          description: "Ocorreu um erro ao carregar os contatos do banco de dados.",
          variant: "destructive"
        });
      }
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    console.log('Iniciando sistema de polling para CRM a cada 5 segundos...');
    
    loadContacts();

    pollingIntervalRef.current = setInterval(() => {
      console.log('Executando polling para atualizar CRM contacts...');
      loadContacts(true);
    }, 5000);

    return () => {
      console.log('Limpando sistema de polling para CRM...');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [loadContacts]);

  const addContact = async (contactData: Omit<CRMContact, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding CRM contact:', contactData);
      
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

      console.log('CRM contact added successfully:', data);

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
      console.log('Updating CRM contact:', id, updates);
      
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

      console.log('CRM contact updated successfully');

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
      console.log('Deleting CRM contact:', id);
      
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('CRM contact deleted successfully');

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
