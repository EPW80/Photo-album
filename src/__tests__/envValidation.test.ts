describe('Environment Validation', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
    // Clear the module cache to allow re-import with different env
    jest.resetModules();
  });

  it('should accept valid NODE_ENV values', () => {
    const validEnvs = ['development', 'production', 'test'];

    validEnvs.forEach((env) => {
      process.env.NODE_ENV = env;
      jest.resetModules();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../app');
      }).not.toThrow();
    });
  });

  it('should throw error for invalid NODE_ENV', () => {
    process.env.NODE_ENV = 'invalid';
    jest.resetModules();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../app');
    }).toThrow(/Invalid NODE_ENV/);
  });

  it('should default to development if NODE_ENV is not set', () => {
    delete process.env.NODE_ENV;
    jest.resetModules();

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../app');
    }).not.toThrow();
  });
});
