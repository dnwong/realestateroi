import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchPanel from './SearchPanel';

describe('SearchPanel', () => {
  it('renders search input and submit button', () => {
    render(<SearchPanel onSearch={vi.fn()} isLoading={false} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-submit-button')).toBeInTheDocument();
  });

  it('shows validation error for empty search', () => {
    render(<SearchPanel onSearch={vi.fn()} isLoading={false} />);
    fireEvent.click(screen.getByTestId('search-submit-button'));
    expect(screen.getByRole('alert')).toHaveTextContent('ZIP code or city');
  });

  it('shows validation error for invalid ZIP', () => {
    render(<SearchPanel onSearch={vi.fn()} isLoading={false} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '1234' } });
    fireEvent.click(screen.getByTestId('search-submit-button'));
    expect(screen.getByRole('alert')).toHaveTextContent('5-digit ZIP');
  });

  it('calls onSearch with correct params for valid ZIP', () => {
    const onSearch = vi.fn();
    render(<SearchPanel onSearch={onSearch} isLoading={false} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: '78701' } });
    fireEvent.click(screen.getByTestId('search-submit-button'));
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ query: '78701', type: 'zip' }));
  });

  it('switches to region type', () => {
    const onSearch = vi.fn();
    render(<SearchPanel onSearch={onSearch} isLoading={false} />);
    fireEvent.click(screen.getByTestId('search-type-region'));
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Austin, TX' } });
    fireEvent.click(screen.getByTestId('search-submit-button'));
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ type: 'region' }));
  });

  it('disables submit button when loading', () => {
    render(<SearchPanel onSearch={vi.fn()} isLoading={true} />);
    expect(screen.getByTestId('search-submit-button')).toBeDisabled();
  });
});
