// SPDX-License-Identifier: GPL-3.0-or-later
import { resetDatabase } from '@shared/db/client';

import { onAppReset, resetAppData } from '../appReset';

jest.mock('@shared/db/client', () => ({
  resetDatabase: jest.fn(async () => {}),
}));

const mockedResetDatabase = resetDatabase as jest.MockedFunction<typeof resetDatabase>;

describe('resetAppData', () => {
  beforeEach(() => {
    mockedResetDatabase.mockClear();
  });

  it('deletes the database before notifying listeners', async () => {
    const listener = jest.fn();
    const unsubscribe = onAppReset(listener);
    await resetAppData();
    unsubscribe();
    expect(mockedResetDatabase).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(mockedResetDatabase.mock.invocationCallOrder[0]).toBeLessThan(
      listener.mock.invocationCallOrder[0],
    );
  });

  it('stops notifying a listener after it unsubscribes', async () => {
    const listener = jest.fn();
    const unsubscribe = onAppReset(listener);
    unsubscribe();
    await resetAppData();
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not notify listeners when the delete fails', async () => {
    mockedResetDatabase.mockRejectedValueOnce(new Error('locked'));
    const listener = jest.fn();
    const unsubscribe = onAppReset(listener);
    await expect(resetAppData()).rejects.toThrow('locked');
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });
});
