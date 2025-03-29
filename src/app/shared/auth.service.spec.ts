import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { User, UserCredential } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { AuthProviderService } from '../wrappers/auth-provider.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

describe('AuthService', () => {
  let service: AuthService;
  let authStateSubject: BehaviorSubject<any | null>;
  let routerMock: jasmine.SpyObj<Router>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let mockAuthProvider: jasmine.SpyObj<AuthProviderService>;

  // Helper function to create mock user objects
  const createMockUser = (overrides = {}) => {
    return {
      uid: '123',
      email: 'test@example.com',
      emailVerified: false,
      displayName: 'Test User',
      ...overrides,
    };
  };

  beforeEach(() => {
    // Create spies with consistent patterns
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    toastServiceMock = jasmine.createSpyObj('ToastService', [
      'showError',
      'showInfo',
      'showSuccess',
    ]);

    mockAuthProvider = jasmine.createSpyObj('AuthProviderService', [
      'getAuthState',
      'signInWithEmailAndPassword',
      'createUserWithEmailAndPassword',
      'signOut',
      'setPersistence',
      'sendEmailVerification',
      'sendPasswordResetEmail',
      'googleSignIn',
    ]);

    // Set up currentUser as a property
    Object.defineProperty(mockAuthProvider, 'currentUser', {
      get: () => null,
    });

    // Create a subject to control auth state in tests
    authStateSubject = new BehaviorSubject<any | null>(null);
    mockAuthProvider.getAuthState.and.returnValue(
      authStateSubject.asObservable()
    );

    // Configure TestBed with mocks
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: AuthProviderService, useValue: mockAuthProvider },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  // Basic tests
  describe('Basic functionality', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with null authState', (done) => {
      service.authState$.subscribe((state) => {
        expect(state).toBeNull();
        done();
      });
    });

    it('should emit user when logged in', (done) => {
      const mockUser = createMockUser();
      authStateSubject.next(mockUser);

      service.authState$.subscribe((state) => {
        expect(state).toEqual(jasmine.objectContaining(mockUser));
        done();
      });
    });
  });

  // Login tests
  describe('Login', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password';

    it('should login successfully with verified email', async () => {
      const mockUser = createMockUser({ emailVerified: true });
      mockAuthProvider.signInWithEmailAndPassword.and.returnValue(
        Promise.resolve({ user: mockUser } as any)
      );

      await service.login(testEmail, testPassword);

      expect(mockAuthProvider.signInWithEmailAndPassword).toHaveBeenCalledWith(
        testEmail,
        testPassword
      );
      expect(mockAuthProvider.setPersistence).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should redirect to verify-email for unverified users', async () => {
      const mockUser = createMockUser({ emailVerified: false });
      mockAuthProvider.signInWithEmailAndPassword.and.returnValue(
        Promise.resolve({ user: mockUser } as any)
      );

      await service.login(testEmail, testPassword);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/verify-email']);
      expect(mockAuthProvider.setPersistence).not.toHaveBeenCalled();
    });

    it('should show error toast when login fails', async () => {
      mockAuthProvider.signInWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Login failed'))
      );

      await service.login(testEmail, testPassword);

      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Login failed. Please check your username/password and try again'
      );
    });
  });

  // Registration tests
  describe('Registration', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password';

    it('should register a new user and send verification email', async () => {
      const mockUser = createMockUser({ email: testEmail });
      mockAuthProvider.createUserWithEmailAndPassword.and.returnValue(
        Promise.resolve({ user: mockUser } as any)
      );

      spyOn(service, 'sendEmailForVerification').and.returnValue(
        Promise.resolve()
      );

      await service.register(testEmail, testPassword);

      expect(
        mockAuthProvider.createUserWithEmailAndPassword
      ).toHaveBeenCalledWith(testEmail, testPassword);
      expect(service.sendEmailForVerification).toHaveBeenCalledWith(
        mockUser as User
      );
    });

    it('should show error toast when registration fails', async () => {
      mockAuthProvider.createUserWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Registration failed'))
      );

      await service.register(testEmail, testPassword);

      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Registration failed. Please try again.'
      );
    });
  });

  // Logout tests
  describe('Logout', () => {
    it('should sign out the user and navigate to login page', async () => {
      mockAuthProvider.signOut.and.returnValue(Promise.resolve());

      await service.logout();

      expect(mockAuthProvider.signOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should show error toast when logout fails', async () => {
      mockAuthProvider.signOut.and.returnValue(
        Promise.reject(new Error('Logout failed'))
      );

      await service.logout();

      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Logout failed. Please try again.'
      );
    });
  });

  // Password reset tests
  describe('Password Reset', () => {
    const testEmail = 'test@example.com';

    it('should send password reset email', async () => {
      mockAuthProvider.sendPasswordResetEmail.and.returnValue(
        Promise.resolve()
      );

      await service.forgotPassword(testEmail);

      expect(mockAuthProvider.sendPasswordResetEmail).toHaveBeenCalledWith(
        testEmail
      );
      expect(toastServiceMock.showInfo).toHaveBeenCalled();
    });

    it('should show error toast when password reset fails', async () => {
      mockAuthProvider.sendPasswordResetEmail.and.returnValue(
        Promise.reject(new Error('Reset failed'))
      );

      await service.forgotPassword(testEmail);

      expect(toastServiceMock.showError).toHaveBeenCalled();
    });
  });

  // Google sign-in tests
  describe('Google Sign-in', () => {
    it('should sign in with Google and set persistence', async () => {
      mockAuthProvider.googleSignIn.and.returnValue(
        Promise.resolve({} as UserCredential)
      );
      mockAuthProvider.setPersistence.and.returnValue(Promise.resolve());

      await service.googleSignIn();

      expect(mockAuthProvider.googleSignIn).toHaveBeenCalled();
      expect(mockAuthProvider.setPersistence).toHaveBeenCalled();
    });

    it('should show error toast when Google sign-in fails', async () => {
      mockAuthProvider.googleSignIn.and.returnValue(
        Promise.reject(new Error('Google sign-in failed'))
      );

      await service.googleSignIn();

      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Google sign-in failed. Please try again.'
      );
    });
  });
});
