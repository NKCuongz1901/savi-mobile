import 'package:flutter/material.dart';
import 'package:savi/screen/onBoarding_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Savi',
      theme: ThemeData(primarySwatch: Colors.blue, fontFamily: 'Poppins'),
      home: OnboardingScreen(),
    );
  }
}
