-- The Invoicing module requires that customers never see draft invoices.
-- The existing customer SELECT policies on invoices/invoice_line_items only
-- scoped by customer_id, so a customer could still read their own drafts by
-- calling the Supabase client directly, bypassing the UI's status filter.
-- Tighten both policies so drafts are unreachable at the RLS layer too.

DROP POLICY "Customers view own invoices" ON public.invoices;
CREATE POLICY "Customers view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() AND status <> 'draft');

DROP POLICY "Customers view own invoice line items" ON public.invoice_line_items;
CREATE POLICY "Customers view own invoice line items" ON public.invoice_line_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_line_items.invoice_id
      AND i.customer_id = auth.uid()
      AND i.status <> 'draft'
  ));
