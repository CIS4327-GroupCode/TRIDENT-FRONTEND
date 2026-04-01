import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../../src/context/ToastContext'
import ToastContainer from '../../src/components/ui/ToastContainer'

// Helper: renders ToastContainer inside a provider with trigger buttons
function TestHarness() {
    const toast = useToast()
    return (
        <>
            <button onClick={() => toast.success('Save succeeded')}>triggerSuccess</button>
            <button onClick={() => toast.error('Something failed')}>triggerError</button>
            <button onClick={() => toast.warning('Heads up')}>triggerWarning</button>
            <button onClick={() => toast.info('FYI')}>triggerInfo</button>
            <ToastContainer />
        </>
    )
}

function renderWithProvider() {
    return render(
        <ToastProvider>
            <TestHarness />
        </ToastProvider>
    )
}

describe('Toast Service', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('renders a success toast with correct message and class', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerSuccess'))
        expect(screen.getByText('Save succeeded')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveClass('text-bg-success')
    })

    it('renders an error toast with danger class', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerError'))
        expect(screen.getByText('Something failed')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveClass('text-bg-danger')
    })

    it('renders a warning toast', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerWarning'))
        expect(screen.getByText('Heads up')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveClass('text-bg-warning')
    })

    it('renders an info toast', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerInfo'))
        expect(screen.getByText('FYI')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveClass('text-bg-info')
    })

    it('auto-dismisses success toast after 5 seconds', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerSuccess'))
        expect(screen.getByText('Save succeeded')).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(5100))
        expect(screen.queryByText('Save succeeded')).not.toBeInTheDocument()
    })

    it('auto-dismisses error toast after 8 seconds', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerError'))
        expect(screen.getByText('Something failed')).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(5100))
        expect(screen.getByText('Something failed')).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(3100))
        expect(screen.queryByText('Something failed')).not.toBeInTheDocument()
    })

    it('manually dismisses a toast via close button', async () => {
        renderWithProvider()
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        await user.click(screen.getByText('triggerSuccess'))
        expect(screen.getByText('Save succeeded')).toBeInTheDocument()

        await user.click(screen.getByLabelText('Close'))
        act(() => jest.advanceTimersByTime(400))
        expect(screen.queryByText('Save succeeded')).not.toBeInTheDocument()
    })

    it('stacks multiple toasts', async () => {
        renderWithProvider()
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        await user.click(screen.getByText('triggerSuccess'))
        await user.click(screen.getByText('triggerError'))
        await user.click(screen.getByText('triggerInfo'))

        expect(screen.getAllByRole('alert')).toHaveLength(3)
    })

    it('throws when useToast is used outside provider', () => {
        function Bad() {
            useToast()
            return null
        }
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => render(<Bad />)).toThrow('useToast must be used within a ToastProvider')
        consoleSpy.mockRestore()
    })

    it('has correct accessibility attributes', async () => {
        renderWithProvider()
        await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).click(screen.getByText('triggerSuccess'))
        const toast = screen.getByRole('alert')
        expect(toast).toHaveAttribute('aria-live', 'assertive')
        expect(toast).toHaveAttribute('aria-atomic', 'true')
    })
})
