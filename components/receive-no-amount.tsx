import { useEffect } from "react"
import { gql, useMutation } from "@apollo/client"

import Invoice from "./invoice"

type OperationError = {
  message: string
}

type LnInvoiceObject = {
  paymentRequest: string
}

const LN_NOAMOUNT_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT = gql`
  mutation lnNoAmountInvoiceCreateOnBehalfOfRecipient($memo: Memo, $walletId: WalletId!) {
    mutationData: lnNoAmountInvoiceCreateOnBehalfOfRecipient(
      input: { memo: $memo, recipientWalletId: $walletId }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

export default function ReceiveNoAmount({
  recipientWalletId,
  onSetAmountClick,
  memo,
}: {
  recipientWalletId: string
  onSetAmountClick: () => void
  memo: string
}) {
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_NOAMOUNT_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, { onError: console.error })

  useEffect(() => {
    createInvoice({
      variables: { memo: memo, walletId: recipientWalletId },
    })
  }, [createInvoice, recipientWalletId, memo])

  if (error) {
    return <div className="error">{error.message}</div>
  }

  let invoice

  if (data) {
    const invoiceData = data.mutationData

    if (invoiceData.errors?.length > 0) {
      return <div className="error">{invoiceData.errors[0].message}</div>
    }

    invoice = invoiceData.invoice
  }

  return (
    <>
      {loading && <div className="loading">Loading...</div>}

      <button className="set-invoice-button" onClick={onSetAmountClick}>
        Set Invoice Amount
      </button>

      {invoice && <Invoice paymentRequest={invoice.paymentRequest} />}
    </>
  )
}
