import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.read<ApiClient>();

    return AppScaffold(
      title: 'Notifications',
      body: FutureBuilder(
        future: api.get('/notifications'),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final notifications = (snapshot.data as List).cast<Map<String, dynamic>>();
          if (notifications.isEmpty) return const Center(child: Text('Aucune notification pour le moment.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final n = notifications[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: Icon(n['isRead'] == true ? Icons.notifications_none : Icons.notifications_active),
                  title: Text(n['title'] ?? ''),
                  subtitle: Text(n['body'] ?? ''),
                  onTap: () => api.patch('/notifications/${n['id']}/read', {}),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
