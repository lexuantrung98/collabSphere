using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace CommunicationService.Services
{
    public interface IFirebaseService
    {
        Task<string> SendNotificationAsync(string token, string title, string body, Dictionary<string, string>? data = null);
        Task<string> SendToTopicAsync(string topic, string title, string body, Dictionary<string, string>? data = null);
    }

    public class FirebaseService : IFirebaseService
    {
        private readonly ILogger<FirebaseService> _logger;
        private readonly FirebaseApp _firebaseApp;

        public FirebaseService(ILogger<FirebaseService> logger, IConfiguration configuration)
        {
            _logger = logger;

            try
            {
                // Check if Firebase is already initialized
                if (FirebaseApp.DefaultInstance == null)
                {
                    var credentialPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-admin-sdk.json");

                    if (File.Exists(credentialPath))
                    {
                        _firebaseApp = FirebaseApp.Create(new AppOptions()
                        {
                            Credential = GoogleCredential.FromFile(credentialPath)
                        });
                        _logger.LogInformation("✅ Firebase initialized successfully");
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ Firebase credentials not found. Notifications disabled.");
                    }
                }
                else
                {
                    _firebaseApp = FirebaseApp.DefaultInstance;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to initialize Firebase");
            }
        }

        public async Task<string> SendNotificationAsync(string token, string title, string body, Dictionary<string, string>? data = null)
        {
            if (_firebaseApp == null)
            {
                return "Firebase not configured";
            }

            try
            {
                var message = new Message()
                {
                    Token = token,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation("✅ Sent notification: {Response}", response);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error sending notification");
                throw;
            }
        }

        public async Task<string> SendToTopicAsync(string topic, string title, string body, Dictionary<string, string>? data = null)
        {
            if (_firebaseApp == null)
            {
                return "Firebase not configured";
            }

            try
            {
                var message = new Message()
                {
                    Topic = topic,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation("✅ Sent to topic {Topic}: {Response}", topic, response);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error sending to topic {Topic}", topic);
                throw;
            }
        }
    }
}
